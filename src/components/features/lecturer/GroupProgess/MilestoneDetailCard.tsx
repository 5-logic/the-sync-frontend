'use client';

import { DownloadOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Input } from 'antd';

import type { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup;
	phase: string;
}

export default function MilestoneDetailCard({ group, phase }: Props) {
	return (
		<Card title={`Milestone - ${phase}`} style={{ height: '100%' }}>
			<p>
				Submission file: {group.submissionFile}{' '}
				<Button icon={<DownloadOutlined />} type="link">
					Download
				</Button>
			</p>
			<p>Submission Date: {group.submissionDate}</p>
			<p>Uploaded by: {group.uploadedBy}</p>
			<Input.TextArea rows={4} placeholder="Enter feedback or notes" />
			<Button icon={<SendOutlined />} type="primary" style={{ marginTop: 12 }}>
				Send Feedback
			</Button>
		</Card>
	);
}
