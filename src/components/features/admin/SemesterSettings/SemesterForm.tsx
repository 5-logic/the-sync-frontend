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
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import { memo, useCallback, useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { SemesterCreate } from '@/schemas/semester';
import { useSemesterStore } from '@/store';

const { Title } = Typography;

interface SemesterFormProps {
	form: FormInstance;
	onSuccess?: () => void;
}

const SemesterForm = memo<SemesterFormProps>(({ form, onSuccess }) => {
	// Use Semester Store
	const { createSemester, creating, clearError } = useSemesterStore();

	const watchedValues = Form.useWatch([], form);

	const isFormValid = Boolean(
		watchedValues?.name?.trim() && watchedValues?.code?.trim(),
	);

	// Clear error when component mounts or unmounts
	useEffect(() => {
		clearError();
		return () => clearError();
	}, [clearError]);

	const handleSubmit = useCallback(
		async (values: SemesterCreate) => {
			// Clear any previous errors
			clearError();

			const semesterData: SemesterCreate = {
				...values,
				code: values.code.trim().toUpperCase(),
				status: 'NotYet',
			};

			// Use store method to create semester
			const success = await createSemester(semesterData);

			if (success) {
				// Success notification is handled in store
				form.resetFields();
				onSuccess?.();
			}
			// Error notification is handled in store
		},
		[createSemester, clearError, form, onSuccess],
	);

	const handleClearForm = useCallback(() => {
		clearError();
		form.resetFields();
	}, [form, clearError]);

	// Set default values for new semester
	useEffect(() => {
		form.setFieldsValue({
			maxGroup: 5,
			defaultThesesPerLecturer: 4,
			maxThesesPerLecturer: 6,
		});
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

				<Form
					form={form}
					requiredMark={false}
					layout="vertical"
					onFinish={handleSubmit}
				>
					<Row gutter={16}>
						<Col xs={24} md={12}>
							<Form.Item
								name="name"
								label={FormLabel({
									text: 'Semester Name',
									isRequired: true,
									isBold: true,
								})}
								rules={nameRules}
								required
							>
								<Input
									placeholder="Enter semester name (e.g., Summer 2025)"
									maxLength={100}
									disabled={creating}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								name="code"
								label={FormLabel({
									text: 'Semester Code',
									isRequired: true,
									isBold: true,
								})}
								rules={codeRules}
								required
							>
								<Input
									placeholder="Enter semester code (e.g., SU25)"
									maxLength={20}
									disabled={creating}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						<Title level={5} style={{ marginBottom: 8 }}>
							Semester Policy
						</Title>
						<Row gutter={16}>
							<Col xs={24} md={8}>
								<Form.Item
									name="maxGroup"
									label={FormLabel({
										text: 'Maximum Number of Groups',
										isBold: true,
									})}
								>
									<InputNumber
										placeholder="Enter maximum number of groups"
										min={1}
										max={1000}
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
										disabled={creating}
										controls={true}
										keyboard={true}
										stringMode={false}
									/>
								</Form.Item>
							</Col>
							<Col xs={24} md={8}>
								<Form.Item
									name="defaultThesesPerLecturer"
									label={FormLabel({
										text: 'Default Theses per Lecturer',
										isBold: true,
									})}
									rules={[{ required: true, message: 'Required' }]}
								>
									<InputNumber
										min={1}
										max={20}
										precision={0}
										style={{ width: '100%' }}
										disabled={creating}
										controls={true}
										keyboard={true}
									/>
								</Form.Item>
							</Col>
							<Col xs={24} md={8}>
								<Form.Item
									name="maxThesesPerLecturer"
									label={FormLabel({
										text: 'Max Theses per Lecturer',
										isBold: true,
									})}
									rules={[{ required: true, message: 'Required' }]}
								>
									<InputNumber
										min={1}
										max={50}
										precision={0}
										style={{ width: '100%' }}
										disabled={creating}
										controls={true}
										keyboard={true}
									/>
								</Form.Item>
							</Col>
						</Row>
					</Space>

					<Row justify="end">
						<Space>
							<Button onClick={handleClearForm} disabled={creating}>
								Clear Form
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								disabled={!isFormValid}
								loading={creating}
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
