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
			});
		}
	}, [open, fetchAdmin, form]);

	const handleFinish = async (values: {
		email: string;
		oldPassword: string;
		newPassword: string;
		confirmPassword: string;
	}) => {
		if (
			values.newPassword &&
			values.confirmPassword &&
			values.newPassword !== values.confirmPassword
		) {
			form.setFields([
				{
					name: 'confirmPassword',
					errors: ['Passwords do not match'],
				},
			]);
			return;
		}
		try {
			const emailChanged = values.email !== adminData.email;
			const passwordChanged = values.oldPassword || values.newPassword;
			if (!emailChanged && !passwordChanged) {
				onClose();
				return;
			}
			const updateDto: AdminUpdate = { email: values.email };
			if (values.oldPassword && values.newPassword) {
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
					rules={[]}
				>
					<Input.Password
						autoComplete="current-password"
						placeholder="Enter current password"
					/>
				</Form.Item>
				<Form.Item
					label={<FormLabel text="New Password" isBold />}
					name="newPassword"
					rules={[
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value) return Promise.resolve();
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
								if (!value) return Promise.resolve();
								if (value !== getFieldValue('newPassword')) {
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
