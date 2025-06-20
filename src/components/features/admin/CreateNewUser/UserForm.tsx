'use client';

import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select, Space, Typography } from 'antd';

const { Option } = Select;
const { Text } = Typography;

type UserFormProps = {
	formType: 'student' | 'lecturer';
	onSubmit: (values: Record<string, unknown>) => void;
};

const passwordIconRender = (visible: boolean) =>
	visible ? <EyeInvisibleOutlined /> : <EyeOutlined />;

const Label = ({ text }: { text: string }) => (
	<Text strong>
		{text} <Text type="danger">*</Text>
	</Text>
);

const UserForm = ({ formType, onSubmit }: UserFormProps) => {
	const [form] = Form.useForm();
	const isStudent = formType === 'student';

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={onSubmit}
			requiredMark="optional"
			style={{
				padding: 20,
				borderRadius: 8,
			}}
		>
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
				<Space style={{ width: '100%', justifyContent: 'flex-end' }}>
					<Button htmlType="button">Cancel</Button>
					<Button type="primary" htmlType="submit">
						{isStudent ? 'Create Student' : 'Create Lecturer'}
					</Button>
				</Space>
			</Form.Item>
		</Form>
	);
};

export default UserForm;
