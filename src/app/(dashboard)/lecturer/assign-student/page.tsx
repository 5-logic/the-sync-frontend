'use client';

import {
	Button,
	Card,
	Form,
	Input,
	Select,
	Table,
	Typography,
	message,
} from 'antd';
import { useState } from 'react';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AssignStudentPage() {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	// Mock data for demonstration
	const [students] = useState([
		{
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
			currentSupervisor: 'Dr. Smith',
		},
		{
			id: 2,
			name: 'Jane Smith',
			email: 'jane@example.com',
			currentSupervisor: 'Unassigned',
		},
		{
			id: 3,
			name: 'Bob Johnson',
			email: 'bob@example.com',
			currentSupervisor: 'Dr. Brown',
		},
	]);

	const [lecturers] = useState([
		{ id: 1, name: 'Dr. Wilson', email: 'wilson@example.com' },
		{ id: 2, name: 'Prof. Davis', email: 'davis@example.com' },
		{ id: 3, name: 'Dr. Miller', email: 'miller@example.com' },
	]);
	const handleAssign = async (values: {
		studentId: number;
		lecturerId: number;
		notes?: string;
	}) => {
		setLoading(true);
		try {
			// Simulate API call
			console.log('Assigning student:', values);
			await new Promise((resolve) => setTimeout(resolve, 1000));
			message.success('Student assigned successfully!');
			form.resetFields();
		} catch {
			message.error('Failed to assign student');
		}
		setLoading(false);
	};

	const columns = [
		{
			title: 'Student Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},
		{
			title: 'Current Supervisor',
			dataIndex: 'currentSupervisor',
			key: 'currentSupervisor',
			render: (text: string) => (
				<span
					className={text === 'Unassigned' ? 'text-red-500' : 'text-green-600'}
				>
					{text}
				</span>
			),
		},
	];

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<Title level={2} className="mb-2">
						👥 Assign Student to Supervisor
					</Title>
					<Text type="secondary">
						Moderator Panel - Assign students to lecturers for supervision{' '}
					</Text>
				</div>
			</div>

			{/* Assignment Form */}
			<Card className="mb-6">
				<Title level={4}>🎯 New Assignment</Title>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleAssign}
					className="mt-4"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.Item
							name="studentId"
							label="Select Student"
							rules={[{ required: true, message: 'Please select a student' }]}
						>
							<Select placeholder="Choose student to assign">
								{students.map((student) => (
									<Option key={student.id} value={student.id}>
										{student.name} ({student.email})
									</Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							name="lecturerId"
							label="Select Supervisor"
							rules={[
								{ required: true, message: 'Please select a supervisor' },
							]}
						>
							<Select placeholder="Choose supervisor">
								{lecturers.map((lecturer) => (
									<Option key={lecturer.id} value={lecturer.id}>
										{lecturer.name} ({lecturer.email})
									</Option>
								))}
							</Select>
						</Form.Item>
					</div>

					<Form.Item name="notes" label="Assignment Notes (Optional)">
						<Input.TextArea
							rows={3}
							placeholder="Add any notes about this assignment..."
						/>
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							size="large"
						>
							Assign Student
						</Button>
					</Form.Item>
				</Form>
			</Card>

			{/* Current Students Table */}
			<Card>
				<Title level={4}>📋 Current Student Assignments</Title>
				<Table
					dataSource={students}
					columns={columns}
					rowKey="id"
					pagination={false}
					className="mt-4"
				/>
			</Card>
		</div>
	);
}
