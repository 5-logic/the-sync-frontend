/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, Modal } from 'antd';
import React, { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { AdminUpdate } from '@/schemas/admin';
import { useAdminStore } from '@/store/useAdminStore';

interface AccountSettingModalProps {
	open: boolean;
	onClose: () => void;
	defaultEmail?: string;
}

const AccountSettingModal: React.FC<AccountSettingModalProps> = ({
	open,
	onClose,
	defaultEmail,
}) => {
	const [form] = Form.useForm();
	const { updateAdmin, loading, setAdmin, fetchAdmin } = useAdminStore();
	const [adminData, setAdminData] = useState<{
		username: string;
		email: string;
	}>({ username: '', email: '' });
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		if (open) {
			fetchAdmin().then((data) => {
				const username = data?.username || '';
				const email = data?.email || '';
				setAdminData({ username, email });
				form.setFieldsValue({
					username,
					email,
					oldPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
				setHasChanges(false);
			});
		}
	}, [open, fetchAdmin, form]);

	// Check for changes whenever form values change
	const handleFormChange = () => {
		const values = form.getFieldsValue();
		const emailChanged = values.email !== adminData.email;
		const passwordFieldsHaveValue =
			values.oldPassword || values.newPassword || values.confirmPassword;

		setHasChanges(emailChanged || passwordFieldsHaveValue);
	};

	const handleFinish = async (values: {
		email: string;
		oldPassword: string;
		newPassword: string;
		confirmPassword: string;
	}) => {
		// Validate password confirmation
		if (values.newPassword && values.newPassword !== values.confirmPassword) {
			form.setFields([
				{
					name: 'confirmPassword',
					errors: ['Passwords do not match'],
				},
			]);
			return;
		}

		// Check if only current password is filled without new password
		if (values.oldPassword && !values.newPassword) {
			form.setFields([
				{
					name: 'newPassword',
					errors: [
						'New password is required when current password is provided',
					],
				},
			]);
			return;
		}

		// Check if new password is filled without current password
		if (values.newPassword && !values.oldPassword) {
			form.setFields([
				{
					name: 'oldPassword',
					errors: ['Current password is required when setting new password'],
				},
			]);
			return;
		}

		try {
			const emailChanged = values.email !== adminData.email;
			const passwordChanged = values.oldPassword && values.newPassword;

			if (!emailChanged && !passwordChanged) {
				onClose();
				return;
			}

			// Build update object with only changed fields
			const updateDto: AdminUpdate = {};

			if (emailChanged) {
				updateDto.email = values.email;
			}

			if (passwordChanged) {
				updateDto.oldPassword = values.oldPassword;
				updateDto.newPassword = values.newPassword;
			}

			const updated = await updateAdmin(updateDto);
			if (updated) {
				setAdmin(updated);
				form.setFieldsValue({
					oldPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
				setHasChanges(false);
				onClose();
			}
		} catch (err: unknown) {
			form.setFields([
				{
					name: 'email',
					errors: [err instanceof Error ? err.message : 'An error occurred!'],
				},
			]);
		}
	};

	return (
		<Modal
			open={open}
			title="Account Settings"
			onCancel={onClose}
			footer={null}
			destroyOnHidden
		>
			<Form
				form={form}
				layout="vertical"
				requiredMark={false}
				onFinish={handleFinish}
				onValuesChange={handleFormChange}
				className="space-y-4"
			>
				<Form.Item label={<FormLabel text="Username" isBold />} name="username">
					<Input readOnly value={adminData.username} />
				</Form.Item>
				<Form.Item
					label={<FormLabel text="Email" isBold />}
					name="email"
					rules={[{ type: 'email', message: 'Invalid email format' }]}
				>
					<Input type="email" value={adminData.email} />
				</Form.Item>
				<Form.Item
					label={<FormLabel text="Current Password" isBold />}
					name="oldPassword"
					dependencies={['newPassword']}
					rules={[
						({ getFieldValue }) => ({
							validator(_, value) {
								const newPassword = getFieldValue('newPassword');
								if (newPassword && !value) {
									return Promise.reject(
										new Error(
											'Current password is required when setting new password',
										),
									);
								}
								return Promise.resolve();
							},
						}),
					]}
				>
					<Input.Password
						autoComplete="current-password"
						placeholder="Enter current password"
					/>
				</Form.Item>
				<Form.Item
					label={<FormLabel text="New Password" isBold />}
					name="newPassword"
					dependencies={['oldPassword']}
					rules={[
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value) return Promise.resolve();

								const oldPassword = getFieldValue('oldPassword');
								if (value && !oldPassword) {
									return Promise.reject(
										new Error(
											'Current password is required when setting new password',
										),
									);
								}

								if (value.length < 12) {
									return Promise.reject(
										new Error('Password must be at least 12 characters long'),
									);
								}
								const pattern =
									/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
								if (!pattern.test(value)) {
									return Promise.reject(
										new Error(
											'Password must include uppercase, lowercase, numbers and special characters',
										),
									);
								}
								return Promise.resolve();
							},
						}),
					]}
				>
					<Input.Password
						autoComplete="new-password"
						placeholder="Enter new password"
					/>
				</Form.Item>
				<Form.Item
					label={<FormLabel text="Confirm New Password" isBold />}
					name="confirmPassword"
					dependencies={['newPassword']}
					rules={[
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value && !getFieldValue('newPassword')) {
									return Promise.resolve();
								}
								if (!value && getFieldValue('newPassword')) {
									return Promise.reject(
										new Error('Please confirm your new password'),
									);
								}
								if (value && value !== getFieldValue('newPassword')) {
									return Promise.reject(new Error('Passwords do not match'));
								}
								return Promise.resolve();
							},
						}),
					]}
				>
					<Input.Password
						autoComplete="new-password"
						placeholder="Confirm new password"
					/>
				</Form.Item>
				<div className="flex justify-end gap-2">
					<Button onClick={onClose} disabled={loading} style={{ minWidth: 90 }}>
						Cancel
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						loading={loading}
						disabled={!hasChanges}
						style={{ minWidth: 120 }}
					>
						Save Changes
					</Button>
				</div>
			</Form>
		</Modal>
	);
};

export default AccountSettingModal;
