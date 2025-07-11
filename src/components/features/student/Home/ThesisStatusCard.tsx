'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tag, Typography } from 'antd';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function ThesisStatusCard({ group }: Readonly<Props>) {
	return (
		<Card
			style={{ height: '100%' }}
			hoverable
			title={
				<Space align="center">
					<FileTextOutlined />
					<Typography.Text strong>Thesis Status</Typography.Text>
				</Space>
			}
		>
			{group ? (
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Tag color="green" style={{ width: 'fit-content' }}>
						Approved
					</Tag>

					<Space direction="vertical" size={4}>
						<Typography.Text type="secondary">Title</Typography.Text>
						<Typography.Text strong style={{ fontSize: 15 }}>
							{group.title}
						</Typography.Text>
					</Space>

					<Space direction="vertical" size={4}>
						<Typography.Text type="secondary">Submitted on</Typography.Text>
						<Typography.Text strong style={{ fontSize: 15 }}>
							{group.submissionDate ?? 'N/A'}
						</Typography.Text>
					</Space>

					<Space direction="vertical" size={4}>
						<Typography.Text type="secondary">Supervisor</Typography.Text>
						<Typography.Text strong style={{ fontSize: 15 }}>
							{group.supervisors.length > 0
								? group.supervisors.join(', ')
								: 'Unassigned'}
						</Typography.Text>
					</Space>
				</Space>
			) : (
				<Button type="primary" block>
					Register Thesis
				</Button>
			)}
		</Card>
	);
}
