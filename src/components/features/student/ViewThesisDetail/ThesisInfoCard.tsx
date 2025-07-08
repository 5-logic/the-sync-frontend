'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Descriptions, Space, Tag, Typography } from 'antd';

import { ExtendedThesis } from '@/data/thesis';

interface Props {
	thesis: ExtendedThesis;
}

export default function ThesisInfoCard({ thesis }: Props) {
	return (
		<Space direction="vertical" style={{ width: '100%' }} size="large">
			<Card
				title={
					<Space direction="vertical" size={0}>
						<Typography.Title level={4} style={{ marginBottom: 0 }}>
							{thesis.englishName}
						</Typography.Title>
						<Typography.Text type="secondary">
							{thesis.vietnameseName}
						</Typography.Text>
					</Space>
				}
				bordered
			>
				<Descriptions
					column={1}
					colon={false}
					labelStyle={{ fontWeight: 600, width: 160 }}
					contentStyle={{ maxWidth: 800 }}
				>
					<Descriptions.Item label="Abbreviation">
						{thesis.abbreviation}
					</Descriptions.Item>

					<Descriptions.Item label="Description">
						{thesis.description}
					</Descriptions.Item>

					<Descriptions.Item label="Domain">
						<Tag color="blue">{thesis.domain}</Tag>
					</Descriptions.Item>

					<Descriptions.Item label="Skills">
						<Space wrap>
							{thesis.skills.map((skill) => (
								<Tag key={skill} color="processing">
									{skill}
								</Tag>
							))}
						</Space>
					</Descriptions.Item>

					<Descriptions.Item label="Version">
						{thesis.version}
					</Descriptions.Item>

					<Descriptions.Item label="Semester">
						{thesis.semester}
					</Descriptions.Item>

					<Descriptions.Item label="Supervisor">
						<Space>
							<Avatar icon={<UserOutlined />} size="small" />
							<span>{thesis.supervisor?.name}</span>
						</Space>
					</Descriptions.Item>
				</Descriptions>
			</Card>
		</Space>
	);
}
