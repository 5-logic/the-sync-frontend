'use client';

import { Button, Form, Input, Radio } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { useOptimizedSession } from '@/hooks/auth/useAuth';
import {
	isValidVietnamesePhone,
	normalizeVietnamesePhone,
} from '@/lib/utils/validations';
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
const VALIDATION_RULES = {
	fullName: [
		{ required: true, message: 'Please enter Full Name' },
		{ min: 2, message: 'Name must be at least 2 characters' },
		{ max: 100, message: 'Name is too long' },
	],
	phoneNumber: [
		{ required: true, message: 'Please enter Phone Number' },
		{
			validator: (_: unknown, value: string) => {
				if (!value) {
					return Promise.reject(new Error('Please enter Phone Number'));
				}

				if (!isValidVietnamesePhone(value)) {
					return Promise.reject(
						new Error('Please enter a valid Vietnamese phone number'),
					);
				}

				return Promise.resolve();
			},
		},
	],
	gender: [{ required: true, message: 'Please select gender' }],
};

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

			// Normalize phone number before sending to API
			const normalizedPhone = normalizeVietnamesePhone(values.phoneNumber);

			// Prepare update profile data (only the fields that can be updated)
			const profileUpdateData: LecturerUpdate = {
				fullName: values.fullName.trim(),
				phoneNumber: normalizedPhone,
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

	return (
		<Form
			layout="vertical"
			form={form}
			requiredMark={false}
			onFinish={handleFinish}
		>
			<Form.Item name="email" label={<FormLabel text="Email" isBold />}>
				<Input disabled />
			</Form.Item>

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

			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
				}}
			>
				<Button type="primary" htmlType="submit" loading={updatingProfile}>
					Save Changes
				</Button>
			</div>
		</Form>
	);
}
