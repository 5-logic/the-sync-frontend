'use client';

import { Col, Row, Space, Typography } from 'antd';

const { Title } = Typography;

export default function ReviewHeader() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Row align="middle" justify="space-between">
				<Col>
					<Title level={4}>Checklist Review</Title>
				</Col>
			</Row>
		</Space>
	);
}
