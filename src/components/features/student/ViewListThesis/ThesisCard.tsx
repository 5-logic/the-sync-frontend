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
			headStyle={{ minHeight: 64 }}
			style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
		>
			<div style={{ flexGrow: 1 }}>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<Typography.Text type="secondary">
						{thesis.description}
					</Typography.Text>

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
				</Space>
			</div>

			<div
				style={{
					marginTop: 'auto',
					display: 'flex',
					justifyContent: 'space-between',
				}}
			>
				<Button type="primary">View Details</Button>
				<Button disabled>Register</Button>
			</div>
		</Card>
	);
}
