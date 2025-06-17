'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { useState } from 'react';

import MilestoneTable from '@/components/features/admin/MilestoneManagement/MilestoneTable';
import { initialMilestoneData } from '@/data/mileStone';
import { Milestone } from '@/schemas/milestone';

const { RangePicker } = DatePicker;

export default function MilestoneManagement() {
	const [data] = useState<Milestone[]>(initialMilestoneData);

	return (
		<div style={{ padding: 24 }}>
			<h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
				Milestones Management
			</h2>

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

			<div style={{ marginTop: 32 }}>
				<MilestoneTable data={data} />
			</div>
		</div>
	);
}
