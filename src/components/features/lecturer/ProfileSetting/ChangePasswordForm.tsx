'use client';

import { Button, Form, Input, Typography } from 'antd';
import { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { showNotification } from '@/lib/utils/notification';
import { StudentPasswordUpdate } from '@/schemas/student';
import { useStudentStore } from '@/store';

export default function ChangePasswordForm() {
	const [form] = Form.useForm();

	// Use Student Store for change password
	const { changePassword, changingPassword, clearError } = useStudentStore();

	// Clear errors when component mounts or unmounts
	useEffect(() => {
		clearError();
		return () => {
			clearError();
		};
	}, [clearError]);

	const handleSubmit = async (values: {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
	}) => {
		// Clear any previous errors
		clearError();

		// Validate password requirements
		if (values.newPassword.length < 12) {
			showNotification.error(
				'Invalid Password',
				'Password must be at least 12 characters long',
			);
			return;
		}

		// Check password complexity
		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
		if (!passwordRegex.test(values.newPassword)) {
			showNotification.error(
				'Invalid Password',
				'Password must include uppercase, lowercase, numbers and special characters',
			);
			return;
		}

		const passwordData: StudentPasswordUpdate = {
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
		};

		// Use store method to change password
		const success = await changePassword(passwordData);

		if (success) {
			// Success notification and auto logout are handled in store
			// No need to reset form as user will be redirected to login
		}
		// Error notification is handled in store
	};

	const handleCancel = () => {
		clearError();
		form.resetFields();
	};

	return (
		<Form
			layout="vertical"
			requiredMark="optional"
			form={form}
			onFinish={handleSubmit}
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
			}}
		>
			<div style={{ flex: 1 }}>
				<Form.Item
					name="currentPassword"
					label={<FormLabel text="Current Password" isRequired isBold />}
					rules={[{ required: true, message: 'Please enter Current Password' }]}
				>
					<Input.Password disabled={changingPassword} />
				</Form.Item>

				<Form.Item
					name="newPassword"
					label={<FormLabel text="New Password" isRequired isBold />}
					rules={[
						{ required: true, message: 'Please enter New Password' },
						{
							min: 12,
							message: 'Password must be at least 12 characters long',
						},
						{
							pattern:
								/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
							message:
								'Password must include uppercase, lowercase, numbers and special characters',
						},
					]}
				>
					<Input.Password disabled={changingPassword} />
				</Form.Item>

				<Form.Item
					name="confirmPassword"
					label={<FormLabel text="Confirm New Password" isRequired isBold />}
					dependencies={['newPassword']}
					rules={[
						{ required: true, message: 'Please enter Confirm New Password' },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('newPassword') === value) {
									return Promise.resolve();
								}
								return Promise.reject(new Error('Passwords do not match'));
							},
						}),
					]}
				>
					<Input.Password disabled={changingPassword} />
				</Form.Item>

				<Typography.Text type="secondary" className="block mb-4">
					Password must be at least 12 characters long and include uppercase,
					lowercase, numbers and special characters.
				</Typography.Text>
			</div>

			<div
				style={{
					paddingTop: 14,
					display: 'flex',
					gap: 8,
					justifyContent: 'flex-end',
				}}
			>
				<Button
					htmlType="button"
					onClick={handleCancel}
					disabled={changingPassword}
				>
					Cancel
				</Button>
				<Button type="primary" htmlType="submit" loading={changingPassword}>
					Update Password
				</Button>
			</div>
		</Form>
	);
}
