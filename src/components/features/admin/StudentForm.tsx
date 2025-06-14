'use client';

import { Button, Form, Input, Radio, Select, message } from 'antd';

const { Option } = Select;

const StudentForm = () => {
	const [form] = Form.useForm();

	const handleSubmit = (values: unknown) => {
		console.log('Student form values:', values);
		message.success('Student created successfully!');
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
				name="studentId"
				label={<Label text="Student ID" />}
				rules={[{ required: true, message: 'Please enter Student ID' }]}
			>
				<Input placeholder="Enter Student ID" />
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
						Create User
					</Button>
				</div>
			</Form.Item>
		</Form>
	);
};

export default StudentForm;

const Label = ({ text }: { text: string }) => (
	<span>
		{text} <span className="text-red-500">*</span>
	</span>
);
