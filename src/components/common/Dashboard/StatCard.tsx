import { Card, Col, Row, Spin, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface StatCardProps {
	value: number;
	title: string;
	icon: React.ReactNode;
	loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ value, title, icon, loading }) => {
	return (
		<Card hoverable styles={{ body: { padding: 0 } }}>
			<Col style={{ padding: 16 }}>
				<Row align="middle" justify="space-between">
					{loading ? (
						<Spin size="small" />
					) : (
						<Title level={3} style={{ margin: 0 }}>
							{value}
						</Title>
					)}
					<span style={{ fontSize: 28 }}>{icon}</span>
				</Row>

				<Row>
					<Text type="secondary" style={{ fontSize: 14 }}>
						{title}
					</Text>
				</Row>
			</Col>
		</Card>
	);
};

export default StatCard;
