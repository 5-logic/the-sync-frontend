'use client';

import { Button, Form, Modal, Select } from 'antd';
import React, { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { FullMockGroup } from '@/data/group';

interface Props {
	open: boolean;
	onCancel: () => void;
	onSubmit: (values: string[]) => void;
	initialValues?: string[];
	group: FullMockGroup | null;
	lecturerOptions: string[];
}

export default function AssignReviewerModal({
	open,
	onCancel,
	onSubmit,
	initialValues = [],
	group,
	lecturerOptions,
}: Readonly<Props>) {
	const [form] = Form.useForm();

	useEffect(() => {
		if (open) {
			form.setFieldsValue({
				reviewer1: initialValues?.[0],
				reviewer2: initialValues?.[1],
			});
		}
	}, [open, initialValues, form]);

	return (
		<Modal
			title={`Assign Reviewers for Group: ${group?.name ?? ''}`}
			open={open}
			onCancel={onCancel}
			footer={null}
			centered
		>
			<Form
				form={form}
				layout="vertical"
				requiredMark={false}
				onFinish={(values) => {
					const selected = [values.reviewer1, values.reviewer2].filter(Boolean);
					onSubmit(selected);
				}}
			>
				<Form.Item
					label={<FormLabel text="Reviewer 1" isRequired isBold />}
					name="reviewer1"
					rules={[
						{ required: true, message: 'Please select at least one reviewer' },
					]}
				>
					<Select
						placeholder="Select reviewer"
						options={lecturerOptions.map((name) => ({
							label: name,
							value: name,
						}))}
						allowClear
					/>
				</Form.Item>

				<Form.Item
					label={<FormLabel text="Reviewer 2" isRequired isBold />}
					name="reviewer2"
					rules={[
						{
							validator(_, value) {
								const r1 = form.getFieldValue('reviewer1');
								if (!value) {
									return Promise.reject(
										new Error('Please select at least one reviewer'),
									);
								}
								if (value === r1) {
									return Promise.reject(
										new Error('Reviewer 2 must be different from Reviewer 1'),
									);
								}
								return Promise.resolve();
							},
						},
					]}
				>
					<Select
						placeholder="Select reviewer"
						options={lecturerOptions.map((name) => ({
							label: name,
							value: name,
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
