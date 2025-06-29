'use client';

import { Form, Input, Radio } from 'antd';
import type { Rule } from 'antd/es/form';

import { FormLabel } from '@/components/common/FormLabel';
import { isValidVietnamesePhone } from '@/lib/utils/validations';

interface PersonFormFieldsProps {
	showFullName?: boolean;
	showEmail?: boolean;
	showPhoneNumber?: boolean;
	showGender?: boolean;
	fullNameRules?: Rule[];
	emailRules?: Rule[];
	phoneNumberRules?: Rule[];
	genderRules?: Rule[];
}

export default function PersonFormFields({
	showFullName = true,
	showEmail = true,
	showPhoneNumber = true,
	showGender = true,
	fullNameRules,
	emailRules,
	phoneNumberRules,
	genderRules,
}: PersonFormFieldsProps) {
	// Default validation rules
	const defaultFullNameRules: Rule[] = [
		{ required: true, message: 'Please enter full name' },
		{ min: 1, message: 'Full name cannot be empty' },
		{ max: 100, message: 'Full name is too long' },
	];

	const defaultEmailRules: Rule[] = [
		{ required: true, message: 'Please enter email' },
		{ type: 'email' as const, message: 'Please enter a valid email' },
	];

	const defaultPhoneNumberRules: Rule[] = [
		{ required: true, message: 'Please enter phone number' },
		{
			validator: (_: unknown, value: string) => {
				if (!value) return Promise.resolve();
				if (isValidVietnamesePhone(value)) {
					return Promise.resolve();
				}
				return Promise.reject(
					new Error('Please enter a valid Vietnamese phone number'),
				);
			},
		},
	];

	const defaultGenderRules: Rule[] = [
		{ required: true, message: 'Please select gender' },
	];

	return (
		<>
			{/* Full Name */}
			{showFullName && (
				<Form.Item
					name="fullName"
					label={<FormLabel text="Full Name" isRequired isBold />}
					rules={fullNameRules || defaultFullNameRules}
				>
					<Input placeholder="Enter full name" />
				</Form.Item>
			)}

			{/* Email */}
			{showEmail && (
				<Form.Item
					name="email"
					label={<FormLabel text="Email" isRequired isBold />}
					rules={emailRules || defaultEmailRules}
				>
					<Input placeholder="Enter email address" />
				</Form.Item>
			)}

			{/* Phone Number */}
			{showPhoneNumber && (
				<Form.Item
					name="phoneNumber"
					label={<FormLabel text="Phone Number" isRequired isBold />}
					rules={phoneNumberRules || defaultPhoneNumberRules}
				>
					<Input placeholder="Enter Vietnamese phone number (e.g., 0901234567)" />
				</Form.Item>
			)}

			{/* Gender */}
			{showGender && (
				<Form.Item
					name="gender"
					label={<FormLabel text="Gender" isRequired isBold />}
					rules={genderRules || defaultGenderRules}
				>
					<Radio.Group>
						<Radio value="Male">Male</Radio>
						<Radio value="Female">Female</Radio>
					</Radio.Group>
				</Form.Item>
			)}
		</>
	);
}
