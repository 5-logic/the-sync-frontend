'use client';

import { TeamOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Typography } from 'antd';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function GroupInformationCard({ group }: Readonly<Props>) {
	return (
		<Card
			style={{ height: '100%' }}
			hoverable
			title={
				<>
					<TeamOutlined /> Group Information
				</>
			}
		>
			{group ? (
				<Space direction="vertical" size="small">
					<Typography.Text type="secondary">Group Name:</Typography.Text>
					<Typography.Text strong style={{ fontSize: 15 }}>
						{group.name}
					</Typography.Text>

					<Typography.Text type="secondary">Group Leader:</Typography.Text>
					<Typography.Text strong style={{ fontSize: 15 }}>
						{group.leader}
					</Typography.Text>

					<Typography.Text type="secondary">Members:</Typography.Text>
					<Row gutter={[8, 4]}>
						{group.members.map((member, index) => (
							<Col span={12} key={index}>
								<Typography.Text strong>• {member}</Typography.Text>
							</Col>
						))}
					</Row>
				</Space>
			) : (
				<Button type="primary" block>
					Join or Create a Group
				</Button>
			)}
		</Card>
	);
}
