'use client';

import { PlusOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	DatePicker,
	Form,
	Input,
	Row,
	Select,
	Space,
	Typography,
} from 'antd';
import { useState } from 'react';

import MilestoneTable from '@/components/features/admin/MilestoneManagement/MilestoneTable';
import { initialMilestoneData } from '@/data/mileStone';
import { Milestone } from '@/schemas/milestone';

const { Title, Paragraph } = Typography;

const { RangePicker } = DatePicker;

export default function MilestoneManagement() {
	const [data] = useState<Milestone[]>(initialMilestoneData);

	return (
		<Space
			direction="vertical"
			size="large"
			style={{ width: '100%', padding: 24 }}
		>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Milestones Management
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Create and manage milestone, registration windows, and
					capstone-specific rules
				</Paragraph>
			</div>
			<Form layout="vertical" requiredMark={false}>
				<Row gutter={16}>
					<Col xs={24} md={8}>
						<Form.Item
							label={
								<>
									Milestone Name<span style={{ color: 'red' }}> *</span>
								</>
							}
							name="milestoneName"
							rules={[
								{ required: true, message: 'Please enter milestone name' },
							]}
						>
							<Input placeholder="Enter milestone name" />
						</Form.Item>
					</Col>

					<Col xs={24} md={8}>
						<Form.Item
							label={
								<>
									Semester<span style={{ color: 'red' }}> *</span>
								</>
							}
							name="semester"
							rules={[{ required: true, message: 'Please select semester' }]}
						>
							<Select
								placeholder="Select semester"
								options={[
									{ value: 'Fall 2023', label: 'Fall 2023' },
									{ value: 'Spring 2024', label: 'Spring 2024' },
									{ value: 'Summer 2024', label: 'Summer 2024' },
								]}
							/>
						</Form.Item>
					</Col>

					<Col xs={24} md={8}>
						<Form.Item
							label={
								<>
									Duration<span style={{ color: 'red' }}> *</span>
								</>
							}
							name="duration"
							rules={[{ required: true, message: 'Please select duration' }]}
						>
							<RangePicker className="w-full" />
						</Form.Item>
					</Col>
				</Row>

				<Row justify="end">
					<Button type="primary" icon={<PlusOutlined />}>
						Create New Milestone
					</Button>
				</Row>
			</Form>

			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<MilestoneTable data={data} />
			</Space>
		</Space>
	);
}
