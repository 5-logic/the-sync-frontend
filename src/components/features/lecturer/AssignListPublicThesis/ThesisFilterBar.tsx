'use client';

import { Col, Input, Row, Select } from 'antd';

export default function ThesisFilterBar() {
	return (
		<Row gutter={[16, 16]} className="mb-4">
			<Col xs={24} md={6}>
				<Input placeholder="Search thesis by name..." allowClear />
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Domain"
					allowClear
					style={{ width: '100%' }}
				>
					<Select.Option value="Blockchain">Blockchain</Select.Option>
					<Select.Option value="IoT">IoT</Select.Option>
				</Select>
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Group"
					allowClear
					style={{ width: '100%' }}
				/>
			</Col>
			<Col xs={24} md={6}>
				<Select
					placeholder="Select Semester"
					allowClear
					style={{ width: '100%' }}
				/>
			</Col>
		</Row>
	);
}
