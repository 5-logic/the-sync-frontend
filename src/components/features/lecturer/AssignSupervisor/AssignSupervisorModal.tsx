import { Button, Form, Modal, Select } from 'antd';
import React, { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';

interface Props {
	open: boolean;
	onCancel: () => void;
	onSubmit: (values: string[]) => void;
	initialValues?: string[];
	supervisorOptions: string[];
}

export default function AssignSupervisorModal({
	open,
	onCancel,
	onSubmit,
	initialValues = [],
	supervisorOptions,
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
	return (
		<Modal
			title="Assign Supervisor"
			open={open}
			onCancel={onCancel}
			footer={null}
			centered
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={{
					supervisor1: initialValues[0],
					supervisor2: initialValues[1],
				}}
				onFinish={(values) => {
					const selected = [values.supervisor1, values.supervisor2].filter(
						Boolean,
					);
					onSubmit(selected);
				}}
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
						options={supervisorOptions.map((sup) => ({
							label: sup,
							value: sup,
						}))}
						allowClear
					/>
				</Form.Item>

				<Form.Item
					label={<FormLabel text="Select Supervisor 2" isRequired isBold />}
					name="supervisor2"
					required={false}
					rules={[
						{
							validator(_, value) {
								const sup1 = form.getFieldValue('supervisor1');
								if (!value || value !== sup1) return Promise.resolve();
								return Promise.reject(
									new Error('Supervisor 2 must be different from Supervisor 1'),
								);
							},
						},
					]}
				>
					<Select
						placeholder="Select supervisor"
						options={supervisorOptions.map((sup) => ({
							label: sup,
							value: sup,
						}))}
						allowClear
					/>
				</Form.Item>

				<Form.Item className="text-right">
					<Button onClick={onCancel} style={{ marginRight: 8 }}>
						Cancel
					</Button>
					<Button type="primary" htmlType="submit">
						Assign
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}
