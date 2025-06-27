import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Form, Input, Space } from 'antd';

export default function PersonalInfoForm() {
	const [form] = Form.useForm();

	return (
		<Form
			layout="vertical"
			form={form}
			initialValues={{
				fullName: 'Dr. John',
				phoneNumber: '+84 123 456 789',
				email: 'john.smith@fpt.edu.vn',
			}}
		>
			<div className="flex justify-center mb-4">
				<Avatar size={80} icon={<UserOutlined />} />
			</div>

			<Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
				<Input />
			</Form.Item>

			<Form.Item
				label="Phone Number"
				name="phoneNumber"
				rules={[{ required: true }]}
			>
				<Input />
			</Form.Item>

			<Form.Item label="Email" name="email">
				<Input disabled />
			</Form.Item>

			<Space>
				<Button>Cancel</Button>
				<Button type="primary" htmlType="submit">
					Save Changes
				</Button>
			</Space>
		</Form>
	);
}
