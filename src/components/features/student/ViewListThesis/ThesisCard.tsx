'use client';

import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tag, Typography } from 'antd';

import { ExtendedThesis } from '@/data/thesis';

interface Props {
	thesis: ExtendedThesis;
}

export default function ThesisCard({ thesis }: Props) {
	return (
		<Card
			title={thesis.englishName}
			extra={<Button>AI Suggest</Button>}
			headStyle={{ minHeight: 64 }}
			style={{ height: '100%' }}
		>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Typography.Text type="secondary">{thesis.description}</Typography.Text>

				<Space direction="vertical">
					<Typography.Text strong>
						<UserOutlined /> {thesis.supervisor?.name}
					</Typography.Text>
					<Tag>{thesis.domain}</Tag>
					<Space wrap>
						{thesis.skills.map((skill) => (
							<Tag key={skill}>{skill}</Tag>
						))}
					</Space>
				</Space>

				<Space>
					<Button type="primary">View Details</Button>
					<Button disabled>Register</Button>
				</Space>
			</Space>
		</Card>
	);
}
