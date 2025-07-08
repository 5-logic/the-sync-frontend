'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Space, Tag, Typography } from 'antd';

import { ExtendedThesis } from '@/data/thesis';

interface Props {
	thesis: ExtendedThesis;
}

export default function ThesisCard({ thesis }: Props) {
	return (
		<Card
			title={null}
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				borderRadius: 12,
			}}
			bodyStyle={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
		>
			<Space
				direction="vertical"
				size="middle"
				style={{ width: '100%', flexGrow: 1 }}
			>
				<Typography.Title level={5} style={{ marginBottom: 0 }}>
					{thesis.englishName}
				</Typography.Title>

				<Typography.Text type="secondary">{thesis.description}</Typography.Text>

				<Space align="center">
					<Avatar size="small" icon={<UserOutlined />} />
					<Typography.Text strong>{thesis.supervisor?.name}</Typography.Text>
				</Space>

				{thesis.domain && (
					<Tag
						bordered
						style={{ background: '#f5f5f5', borderColor: '#d9d9d9' }}
					>
						{thesis.domain}
					</Tag>
				)}

				<Space wrap size={[8, 8]}>
					{thesis.skills.map((skill) => (
						<Tag
							key={skill}
							color="processing"
							style={{ borderRadius: 6, border: '1px solid #91d5ff' }}
						>
							{skill}
						</Tag>
					))}
				</Space>
			</Space>

			<div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
				<Button type="primary" block>
					View Details
				</Button>
				<Button disabled block>
					Register
				</Button>
			</div>
		</Card>
	);
}
