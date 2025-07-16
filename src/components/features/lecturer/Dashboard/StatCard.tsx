import { Card, Col, Row, Space, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface StatCardProps {
	value: number;
	title: string;
	icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, title, icon }) => {
	return (
		<Card hoverable bodyStyle={{ padding: 0 }}>
			<Row style={{ height: 100, padding: 16 }} align="middle">
				<Col flex="auto">
					<Space direction="vertical" size={0}>
						<Title level={3} style={{ margin: 0 }}>
							{value}
						</Title>
						<Text type="secondary">{title}</Text>
					</Space>
				</Col>
				<Col>
					<Space>{icon}</Space>
				</Col>
			</Row>
		</Card>
	);
};

export default StatCard;
