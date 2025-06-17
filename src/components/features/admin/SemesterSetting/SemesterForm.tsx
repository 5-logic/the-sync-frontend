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
	notification,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import { memo, useCallback, useState } from 'react';

import semesterService from '@/lib/services/semesters.service';
import { SemesterCreate } from '@/schemas/semester';

const { Title } = Typography;

interface SemesterFormProps {
	form: FormInstance;
	onSuccess?: () => void;
}

const SemesterForm = memo<SemesterFormProps>(({ form, onSuccess }) => {
	const [loading, setLoading] = useState(false);
	const watchedValues = Form.useWatch([], form);

	const isFormValid = Boolean(
		watchedValues?.name?.trim() && watchedValues?.code?.trim(),
	);

	const handleSubmit = useCallback(
		async (values: SemesterCreate) => {
			setLoading(true);
			try {
				const semesterData: SemesterCreate = {
					...values,
					code: values.code.trim().toUpperCase(),
					status: 'NotYet',
				};

				const response = await semesterService.create(semesterData);

				if (response.success) {
					notification.success({
						message: 'Success',
						description: 'Semester created successfully',
						placement: 'bottomRight',
					});
					form.resetFields();
					onSuccess?.();
				} else {
					notification.error({
						message: 'Error',
						description: 'Failed to create semester',
						placement: 'bottomRight',
					});
				}
			} catch (error) {
				console.error('Error creating semester:', error);
				notification.error({
					message: 'Error',
					description: 'Error creating semester',
					placement: 'bottomRight',
				});
			} finally {
				setLoading(false);
			}
		},
		[form, onSuccess],
	);

	const handleClearForm = useCallback(() => {
		form.resetFields();
	}, [form]);

	const nameRules = [
		{ required: true, message: 'Semester name is required' },
		{ max: 100, message: 'Name must be less than 100 characters' },
	];

	const codeRules = [
		{ required: true, message: 'Semester code is required' },
		{ max: 20, message: 'Code must be less than 20 characters' },
	];

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
								rules={nameRules}
								required
							>
								<Input
									placeholder="Enter semester name (e.g., Spring 2025)"
									maxLength={100}
									disabled={loading}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name="code"
								label="Semester Code"
								rules={codeRules}
								required
							>
								<Input
									placeholder="Enter semester code (e.g., SP25)"
									maxLength={20}
									disabled={loading}
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
								min={1 as number}
								max={1000 as number}
								precision={0}
								parser={(value) =>
									Number((value ?? '').replace(/\$\s?|(,*)/g, ''))
								}
								formatter={(value) =>
									value !== undefined && value !== null
										? Number(value).toLocaleString('en-US')
										: ''
								}
								style={{ width: '100%' }}
								disabled={loading}
								controls={true}
								keyboard={true}
								stringMode={false}
							/>
						</Form.Item>
					</Space>

					<Row justify="end">
						<Space>
							<Button onClick={handleClearForm} disabled={loading}>
								Clear Form
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								disabled={!isFormValid}
								loading={loading}
							>
								Create Semester
							</Button>
						</Space>
					</Row>
				</Form>
			</Space>
		</Card>
	);
});

SemesterForm.displayName = 'SemesterForm';

export default SemesterForm;
