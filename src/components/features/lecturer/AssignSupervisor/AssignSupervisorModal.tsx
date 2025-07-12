import { Button, Form, Modal, Select, Spin } from 'antd';
import React, { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';

interface LecturerOption {
	label: string;
	value: string;
}

interface Props {
	readonly open: boolean;
	readonly loading?: boolean;
	readonly onCancel: () => void;
	readonly onSubmit: (values: string[]) => void;
	readonly initialValues?: string[];
	readonly lecturerOptions: LecturerOption[];
	readonly isChangeMode?: boolean;
}

export default function AssignSupervisorModal({
	open,
	loading = false,
	onCancel,
	onSubmit,
	initialValues = [],
	lecturerOptions,
	isChangeMode = false,
}: Props) {
	const [form] = Form.useForm();

	useEffect(() => {
		if (open) {
			form.setFieldsValue({
				supervisor1: initialValues?.[0],
				supervisor2: initialValues?.[1],
			});
		}
	}, [open, initialValues, form]);

	const handleFinish = (values: {
		supervisor1?: string;
		supervisor2?: string;
	}) => {
		const selected = [values.supervisor1, values.supervisor2].filter(
			(id): id is string => Boolean(id),
		);

		onSubmit(selected);
	};

	return (
		<Modal
			title={isChangeMode ? 'Change Supervisor' : 'Assign Supervisor'}
			open={open}
			onCancel={onCancel}
			footer={null}
			centered
		>
			<Spin spinning={loading}>
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						supervisor1: initialValues[0],
						supervisor2: initialValues[1],
					}}
					onFinish={handleFinish}
				>
					<Form.Item
						label={<FormLabel text="Select Supervisor 1" isRequired isBold />}
						name="supervisor1"
						required={false}
						rules={[
							{
								required: true,
								message: 'Please select at least one supervisor',
							},
						]}
					>
						<Select
							placeholder="Select supervisor"
							options={lecturerOptions}
							allowClear
							showSearch
							filterOption={(input, option) =>
								(option?.label ?? '')
									.toLowerCase()
									.includes(input.toLowerCase())
							}
						/>
					</Form.Item>

					<Form.Item
						label={<FormLabel text="Select Supervisor 2" isBold />}
						name="supervisor2"
						required={false}
						rules={[
							{
								validator(_, value) {
									const sup1 = form.getFieldValue('supervisor1');

									if (value && value === sup1) {
										return Promise.reject(
											new Error(
												'Supervisor 2 must be different from Supervisor 1',
											),
										);
									}

									return Promise.resolve();
								},
							},
						]}
					>
						<Select
							placeholder="Select supervisor (optional)"
							options={lecturerOptions}
							allowClear
							showSearch
							filterOption={(input, option) =>
								(option?.label ?? '')
									.toLowerCase()
									.includes(input.toLowerCase())
							}
						/>
					</Form.Item>

					<Form.Item className="text-right">
						<Button
							onClick={onCancel}
							style={{ marginRight: 8 }}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="primary" htmlType="submit" loading={loading}>
							{isChangeMode ? 'Change' : 'Assign'}
						</Button>
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
}
