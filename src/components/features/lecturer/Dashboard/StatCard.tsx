import { Card, Space, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface StatCardProps {
	value: number;
	title: string;
	icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, title, icon }) => {
	return (
		<Card>
			<Space
				style={{ width: '100%', justifyContent: 'space-between' }}
				align="center"
			>
				<Space direction="vertical" size={0}>
					<Title level={3} style={{ margin: 0 }}>
						{value}
					</Title>
					<Text type="secondary">{title}</Text>
				</Space>
				{icon}
			</Space>
		</Card>
	);
};

export default StatCard;
