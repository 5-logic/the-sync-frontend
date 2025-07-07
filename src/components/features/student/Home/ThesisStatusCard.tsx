'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Progress, Space, Tag, Typography } from 'antd';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function ThesisStatusCard({ group }: Props) {
	return (
		<Card
			style={{ height: '100%' }}
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

					<div>
						<Typography.Text type="secondary" style={{ fontSize: 14 }}>
							Title
						</Typography.Text>
						<br />
						<Typography.Text strong style={{ fontSize: 15 }}>
							{group.title}
						</Typography.Text>
					</div>

					<div>
						<Typography.Text type="secondary" style={{ fontSize: 14 }}>
							Submitted on
						</Typography.Text>
						<br />
						<Typography.Text strong style={{ fontSize: 15 }}>
							{group.submissionDate ?? 'N/A'}
						</Typography.Text>
					</div>

					<div>
						<Typography.Text type="secondary" style={{ fontSize: 14 }}>
							Progress
						</Typography.Text>
						<Progress
							percent={group.progress}
							showInfo={false}
							strokeColor="#1890ff"
							style={{ marginTop: 4 }}
						/>
						<Typography.Text type="secondary">
							{group.progress}% completed
						</Typography.Text>
					</div>
				</Space>
			) : (
				<Button type="primary" block>
					Register Thesis
				</Button>
			)}
		</Card>
	);
}
