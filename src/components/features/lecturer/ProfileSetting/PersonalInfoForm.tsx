'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Form, Input, Radio, Space } from 'antd';
import { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { useOptimizedSession } from '@/hooks/auth/useAuth';
import { LecturerUpdate } from '@/schemas/lecturer';
import { useLecturerStore } from '@/store';

export default function PersonalInfoForm() {
	const [form] = Form.useForm();
	const { session, isAuthenticated } = useOptimizedSession();

	// Use Lecturer Store for update profile
	const { updateProfile, updatingProfile, clearError } = useLecturerStore();

	// Clear errors when component mounts
	useEffect(() => {
		clearError();
	}, [clearError]);

	// Set form values from session data
	useEffect(() => {
		if (isAuthenticated && session?.user) {
			form.setFieldsValue({
				fullName: session.user.fullName || '',
				phoneNumber: session.user.phoneNumber || '',
				email: session.user.email || '',
				gender: session.user.gender || '',
			});
		}
	}, [session, isAuthenticated, form]);

	const handleFinish = async (values: {
		fullName: string;
		phoneNumber: string;
		gender: string;
	}) => {
		// Clear any previous errors
		clearError();

		// Prepare update profile data (only the fields that can be updated)
		const profileUpdateData: LecturerUpdate = {
			fullName: values.fullName.trim(),
			phoneNumber: values.phoneNumber.trim(),
			gender: values.gender as 'Male' | 'Female',
		};

		// Use store method to update profile
		const success = await updateProfile(profileUpdateData);

		if (success) {
			// Success notification is handled in store
			// Form will keep current values as they are now updated
		}
		// Error notification is handled in store
	};

	const handleCancel = () => {
		clearError();
		// Reset form to original values from session
		if (isAuthenticated && session?.user) {
			form.setFieldsValue({
				fullName: session.user.fullName || '',
				phoneNumber: session.user.phoneNumber || '',
				email: session.user.email || '',
				gender: session.user.gender || '',
			});
		}
	};

	return (
		<Form
			layout="vertical"
			form={form}
			requiredMark={false}
			onFinish={handleFinish}
		>
			<Space
				direction="vertical"
				align="center"
				style={{ width: '100%', marginBottom: 16 }}
			>
				<Avatar size={80} icon={<UserOutlined />} />
			</Space>

			<Form.Item
				name="fullName"
				label={<FormLabel text="Full Name" isBold />}
				rules={[
					{ required: true, message: 'Please enter Full Name' },
					{ min: 2, message: 'Name must be at least 2 characters' },
					{ max: 100, message: 'Name is too long' },
				]}
			>
				<Input disabled={updatingProfile} />
			</Form.Item>

			<Form.Item
				name="phoneNumber"
				label={<FormLabel text="Phone Number" isBold />}
				rules={[
					{ required: true, message: 'Please enter Phone Number' },
					{
						pattern:
							/^(?:\+84|0084|84|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-5]|9[0-4|6-9])\d{7}$/,
						message: 'Please enter a valid Vietnamese phone number',
					},
				]}
			>
				<Input disabled={updatingProfile} />
			</Form.Item>

			<Form.Item
				name="gender"
				label={<FormLabel text="Gender" isBold />}
				rules={[{ required: true, message: 'Please select gender' }]}
			>
				<Radio.Group disabled={updatingProfile}>
					<Radio value="Male">Male</Radio>
					<Radio value="Female">Female</Radio>
				</Radio.Group>
			</Form.Item>

			<Form.Item name="email" label={<FormLabel text="Email" isBold />}>
				<Input disabled />
			</Form.Item>

			<div
				style={{
					display: 'flex',
					gap: 8,
					justifyContent: 'flex-end',
				}}
			>
				<Button onClick={handleCancel} disabled={updatingProfile}>
					Cancel
				</Button>
				<Button type="primary" htmlType="submit" loading={updatingProfile}>
					Save Changes
				</Button>
			</div>
		</Form>
	);
}
