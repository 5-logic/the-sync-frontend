'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Form, Input, Radio, Space } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { useOptimizedSession } from '@/hooks/auth/useAuth';
import { LecturerUpdate } from '@/schemas/lecturer';
import { useLecturerStore } from '@/store';

// Types
interface FormValues {
	fullName: string;
	phoneNumber: string;
	gender: string;
	email: string;
}

// Constants moved outside component to prevent recreation
const PHONE_PATTERN =
	/^(?:\+84|0084|84|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-5]|9[0-4|6-9])\d{7}$/;

const VALIDATION_RULES = {
	fullName: [
		{ required: true, message: 'Please enter Full Name' },
		{ min: 2, message: 'Name must be at least 2 characters' },
		{ max: 100, message: 'Name is too long' },
	],
	phoneNumber: [
		{ required: true, message: 'Please enter Phone Number' },
		{
			pattern: PHONE_PATTERN,
			message: 'Please enter a valid Vietnamese phone number',
		},
	],
	gender: [{ required: true, message: 'Please select gender' }],
};

// Styling constants
const AVATAR_SIZE = 80;
const FORM_SPACING = 16;
const BUTTON_GAP = 8;

export default function PersonalInfoForm() {
	const [form] = Form.useForm();
	const { session, isAuthenticated } = useOptimizedSession();

	// Use Lecturer Store for update profile
	const { updateProfile, updatingProfile, clearError } = useLecturerStore();

	// Memoize form data to prevent unnecessary re-renders
	const formData = useMemo((): FormValues => {
		if (!isAuthenticated || !session?.user) {
			return {
				fullName: '',
				phoneNumber: '',
				email: '',
				gender: '',
			};
		}

		return {
			fullName: session.user.fullName ?? '',
			phoneNumber: session.user.phoneNumber ?? '',
			email: session.user.email ?? '',
			gender: session.user.gender ?? '',
		};
	}, [isAuthenticated, session?.user]);

	// Clear errors when component mounts
	useEffect(() => {
		clearError();
	}, [clearError]);

	// Set form values from session data
	useEffect(() => {
		form.setFieldsValue(formData);
	}, [form, formData]);

	const handleFinish = useCallback(
		async (values: Pick<FormValues, 'fullName' | 'phoneNumber' | 'gender'>) => {
			// Clear any previous errors
			clearError();

			// Validate input data
			if (!values.fullName?.trim()) {
				return;
			}

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
		},
		[clearError, updateProfile],
	);

	const handleCancel = useCallback(() => {
		clearError();
		// Reset form to original values from session
		form.setFieldsValue(formData);
	}, [clearError, form, formData]);

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
				style={{ width: '100%', marginBottom: FORM_SPACING }}
			>
				<Avatar size={AVATAR_SIZE} icon={<UserOutlined />} />
			</Space>

			<Form.Item
				name="fullName"
				label={<FormLabel text="Full Name" isBold />}
				rules={VALIDATION_RULES.fullName}
			>
				<Input disabled={updatingProfile} />
			</Form.Item>

			<Form.Item
				name="phoneNumber"
				label={<FormLabel text="Phone Number" isBold />}
				rules={VALIDATION_RULES.phoneNumber}
			>
				<Input disabled={updatingProfile} />
			</Form.Item>

			<Form.Item
				name="gender"
				label={<FormLabel text="Gender" isBold />}
				rules={VALIDATION_RULES.gender}
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
					gap: BUTTON_GAP,
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
