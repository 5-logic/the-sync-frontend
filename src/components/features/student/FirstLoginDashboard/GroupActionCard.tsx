'use client';

import { Button, Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface Props {
	icon: React.ReactNode;
	title: string;
	description: string;
	buttonText: string;
	onClick?: () => void;
	type?: 'primary' | 'default';
}

export default function GroupActionCard({
	icon,
	title,
	description,
	buttonText,
	onClick,
	type = 'default',
}: Props) {
	return (
		<Card
			style={{
				width: 260,
				textAlign: 'center',
				border: '1px solid #e5e7eb',
				borderRadius: 12,
			}}
			bodyStyle={{ padding: 24 }}
		>
			{icon}
			<Title level={4} style={{ marginBottom: 0 }}>
				{title}
			</Title>
			<Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
				{description}
			</Text>
			<Button type={type} block onClick={onClick}>
				{buttonText}
			</Button>
		</Card>
	);
}
