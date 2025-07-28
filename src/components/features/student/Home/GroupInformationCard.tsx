'use client';

import { TeamOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tooltip, Typography } from 'antd';
import { useRouter } from 'next/navigation';

import { FullMockGroup } from '@/data/group';

interface Props {
	group: FullMockGroup | null;
}

export default function GroupInformationCard({ group }: Readonly<Props>) {
	const router = useRouter();

	const handleClick = () => {
		if (group) {
			router.push('/student/group-detail');
		}
	};

	return (
		<Card
			hoverable
			style={{ height: '100%', cursor: group ? 'pointer' : 'default' }}
			onClick={handleClick}
			title={
				<Tooltip title={group ? 'Click to view details' : ''}>
					<Space align="center">
						<TeamOutlined style={{ color: '#1890ff' }} />
						<Typography.Text strong style={{ fontSize: 16, color: '#1890ff' }}>
							Group Information
						</Typography.Text>
					</Space>
				</Tooltip>
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
						{group.members.map((member) => (
							<Col span={12} key={member.id}>
								<Typography.Text strong>• {member.name}</Typography.Text>
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
