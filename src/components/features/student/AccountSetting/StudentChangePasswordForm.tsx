'use client';

import { Button, Form, Input, Row, Space, Typography } from 'antd';
import React from 'react';

import { FormLabel } from '@/components/common/FormLabel';

const { Title, Text } = Typography;

export default function StudentChangePasswordForm() {
	const [form] = Form.useForm();

	const handleFinish = (values: Record<string, unknown>) => {
		console.log('Password values:', values);
	};

	return (
		<Form
			requiredMark={false}
			form={form}
			layout="vertical"
			onFinish={handleFinish}
			style={{ background: '#fff', borderRadius: 12, padding: 0 }}
		>
			<Title level={5} style={{ marginBottom: 24 }}>
				Change Password
			</Title>
			<Form.Item
				name="currentPassword"
				label={<FormLabel text="Current Password" isBold />}
				rules={[
					{ required: true, message: 'Please enter your current password' },
				]}
			>
				<Input.Password placeholder="Enter current password" />
			</Form.Item>
			<Form.Item
				name="newPassword"
				label={<FormLabel text="New Password" isBold />}
				rules={[
					{ required: true, message: 'Please enter a new password' },
					{ min: 8, message: 'Password must be at least 8 characters' },
				]}
			>
				<Input.Password placeholder="Enter new password" />
			</Form.Item>
			<Form.Item
				name="confirmPassword"
				label={<FormLabel text="Confirm New Password" isBold />}
				dependencies={['newPassword']}
				rules={[
					{ required: true, message: 'Please confirm your new password' },
					({ getFieldValue }) => ({
						validator(_, value) {
							if (!value || getFieldValue('newPassword') === value) {
								return Promise.resolve();
							}
							return Promise.reject(new Error('Passwords do not match!'));
						},
					}),
				]}
			>
				<Input.Password placeholder="Confirm new password" />
			</Form.Item>
			<Text type="secondary" style={{ fontSize: 13 }}>
				Password must be at least 12 characters long and include uppercase,
				lowercase, numbers and special characters.
			</Text>
			<Row justify="end" style={{ marginTop: 24 }}>
				<Space>
					<Button htmlType="button">Cancel</Button>
					<Button type="primary" htmlType="submit">
						Update Password
					</Button>
				</Space>
			</Row>
		</Form>
	);
}
