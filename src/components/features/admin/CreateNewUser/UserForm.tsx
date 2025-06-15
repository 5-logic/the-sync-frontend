'use client';

import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select } from 'antd';

const { Option } = Select;

type UserFormProps = {
	formType: 'student' | 'lecturer';
	onSubmit: (values: Record<string, unknown>) => void;
};

const UserForm = ({ formType, onSubmit }: UserFormProps) => {
	const [form] = Form.useForm();
	const isStudent = formType === 'student';

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={onSubmit}
			requiredMark={false}
			className="bg-white p-8 space-y-6"
		>
			{/* Semester */}
			<Form.Item
				name="semester"
				label={<Label text="Semester" />}
				rules={[{ required: true, message: 'Please select a semester' }]}
			>
				<Select placeholder="Select semester">
					{['Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026'].map(
						(sem) => (
							<Option key={sem} value={sem}>
								{sem}
							</Option>
						),
					)}
				</Select>
			</Form.Item>

			{/* Full name */}
			<Form.Item
				name="fullName"
				label={<Label text="Full Name" />}
				rules={[{ required: true, message: 'Please enter full name' }]}
			>
				<Input placeholder="Enter full name" />
			</Form.Item>

			{/* Email */}
			<Form.Item
				name="email"
				label={<Label text="Email Address" />}
				rules={[
					{ required: true, message: 'Please enter email address' },
					{ type: 'email', message: 'Enter a valid email address' },
				]}
			>
				<Input placeholder="Enter email address" />
			</Form.Item>

			{/* Conditional Field */}
			{isStudent ? (
				<Form.Item
					name="studentId"
					label={<Label text="Student ID" />}
					rules={[{ required: true, message: 'Please enter Student ID' }]}
				>
					<Input placeholder="Enter Student ID" />
				</Form.Item>
			) : (
				<Form.Item
					name="phoneNumber"
					label={<Label text="Phone Number" />}
					rules={[
						{ required: true, message: 'Please enter phone number' },
						{
							pattern: /^(0|\+84)(\d{9})$/,
							message: 'Please enter a valid Vietnamese phone number',
						},
					]}
				>
					<Input.Password
						placeholder="Enter phone number"
						size="large"
						iconRender={passwordIconRender}
					/>
				</Form.Item>
			)}

			{/* Gender */}
			<Form.Item
				name="gender"
				label={<Label text="Gender" />}
				rules={[{ required: true, message: 'Please select gender' }]}
			>
				<Radio.Group>
					<Radio value="Male">Male</Radio>
					<Radio value="Female">Female</Radio>
				</Radio.Group>
			</Form.Item>

			{/* Submit */}
			<Form.Item>
				<div className="flex justify-end gap-4">
					<Button htmlType="button" className="border border-gray-300">
						Cancel
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						className="bg-blue-600 hover:bg-blue-700"
					>
						{isStudent ? 'Create User' : 'Create Lecturer'}
					</Button>
				</div>
			</Form.Item>
		</Form>
	);
};

export default UserForm;

const passwordIconRender = (visible: boolean) =>
	visible ? <EyeInvisibleOutlined /> : <EyeOutlined />;

const Label = ({ text }: { text: string }) => (
	<span>
		{text} <span className="text-red-500">*</span>
	</span>
);
