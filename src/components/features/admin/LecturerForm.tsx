'use client';

import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select, message } from 'antd';

const { Option } = Select;

const LecturerForm = () => {
	const [form] = Form.useForm();

	const handleSubmit = (values: unknown) => {
		console.log('Lecturer form values:', values);
		message.success('Lecturer created successfully!');
	};

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={handleSubmit}
			requiredMark={false}
			className="bg-white p-8 space-y-6"
		>
			<Form.Item
				name="semester"
				label={<Label text="Semester" />}
				rules={[{ required: true, message: 'Please select a semester' }]}
			>
				<Select placeholder="Select semester">
					<Option value="Spring 2025">Spring 2025</Option>
					<Option value="Fall 2025">Fall 2025</Option>
					<Option value="Spring 2026">Spring 2026</Option>
					<Option value="Fall 2026">Fall 2026</Option>
				</Select>
			</Form.Item>

			<Form.Item
				name="fullName"
				label={<Label text="Full Name" />}
				rules={[{ required: true, message: 'Please enter full name' }]}
			>
				<Input placeholder="Enter full name" />
			</Form.Item>

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

			<Form.Item
				name="phoneNumber"
				label={<Label text="Phone Number" />}
				rules={[
					{ required: true, message: 'Please enter your phone number' },
					{
						pattern: /^(0|\+84)(\d{9})$/,
						message: 'Please enter a valid Vietnamese phone number',
					},
				]}
			>
				<Input.Password
					placeholder="Enter your phone number"
					size="large"
					iconRender={(visible) =>
						visible ? <EyeInvisibleOutlined /> : <EyeOutlined />
					}
				/>
			</Form.Item>

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
						Create Lecturer
					</Button>
				</div>
			</Form.Item>
		</Form>
	);
};

export default LecturerForm;

const Label = ({ text }: { text: string }) => (
	<span>
		{text} <span className="text-red-500">*</span>
	</span>
);
