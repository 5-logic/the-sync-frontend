'use client';

import {
	Button,
	Card,
	Col,
	Form,
	Input,
	InputNumber,
	Row,
	Space,
	Typography,
	message,
} from 'antd';
import type { FormInstance } from 'antd/es/form';

import semesterService from '@/lib/services/semesters.service';
import { SemesterCreate } from '@/schemas/semester';

const { Title } = Typography;

interface SemesterFormProps {
	form: FormInstance;
	onSuccess?: () => void;
}

const SemesterForm = ({ form, onSuccess }: SemesterFormProps) => {
	const handleSubmit = async (values: SemesterCreate) => {
		try {
			const semesterData: SemesterCreate = {
				...values,
				status: 'NotYet',
			};

			const response = await semesterService.create(semesterData);

			if (response.success) {
				message.success('Semester created successfully');
				form.resetFields();
				onSuccess?.();
			} else {
				message.error('Failed to create semester');
			}
		} catch (error) {
			console.error('Error creating semester:', error);
			message.error('Error creating semester');
		}
	};

	return (
		<Card>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Title level={4} style={{ marginBottom: 0 }}>
					Add New Semester
				</Title>

				<Form form={form} layout="vertical" onFinish={handleSubmit}>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name="name"
								label="Semester Name"
								rules={[
									{ required: true, message: 'Semester name is required' },
									{
										max: 100,
										message: 'Name must be less than 100 characters',
									},
								]}
								required
							>
								<Input
									placeholder="Enter semester name (e.g., Spring 2025)"
									maxLength={100}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name="code"
								label="Semester Code"
								rules={[
									{ required: true, message: 'Semester code is required' },
									{ max: 20, message: 'Code must be less than 20 characters' },
								]}
								required
							>
								<Input
									placeholder="Enter semester code (e.g., SP25)"
									maxLength={20}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						<Title level={5} style={{ marginBottom: 8 }}>
							Semester Policy
						</Title>
						<Form.Item name="maxGroup" label="Max Group">
							<InputNumber
								placeholder="Enter maximum number of groups"
								min={1}
								style={{ width: '100%' }}
							/>
						</Form.Item>
					</Space>

					<Row justify="end">
						<Space>
							<Button onClick={() => form.resetFields()}>Clear Form</Button>
							<Button type="primary" htmlType="submit">
								Create Semester
							</Button>
						</Space>
					</Row>
				</Form>
			</Space>
		</Card>
	);
};

export default SemesterForm;
