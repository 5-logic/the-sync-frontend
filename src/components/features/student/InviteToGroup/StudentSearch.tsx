'use client';

import { Button, Card, Col, Form, Input, Row } from 'antd';

export const StudentSearch = () => {
	return (
		<Card>
			<Form layout="vertical">
				<Row gutter={16}>
					<Col xs={24} sm={12}>
						<Form.Item label="Skills">
							<Input placeholder="Enter skills and press Enter" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={12}>
						<Form.Item label="Roles">
							<Input placeholder="Enter roles" />
						</Form.Item>
					</Col>
				</Row>

				<Button type="primary">Suggest Groups</Button>
			</Form>
		</Card>
	);
};
