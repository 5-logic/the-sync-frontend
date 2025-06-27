import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Form, Input, Space } from 'antd';

import FormLabel from '@/components/common/FormLabel/FormLabel';

export default function PersonalInfoForm() {
	const [form] = Form.useForm();

	return (
		<Form
			layout="vertical"
			form={form}
			requiredMark="optional"
			initialValues={{
				fullName: 'Dr. John',
				phoneNumber: '+84 123 456 789',
				email: 'john.smith@fpt.edu.vn',
			}}
		>
			<div className="flex justify-center mb-4">
				<Avatar size={80} icon={<UserOutlined />} />
			</div>

			<Form.Item
				name="fullName"
				label={<FormLabel text="Full Name" isRequired isBold />}
				rules={[{ required: true, message: 'Please enter Full Name' }]}
			>
				<Input />
			</Form.Item>

			<Form.Item
				name="phoneNumber"
				label={<FormLabel text="Phone Number" isRequired isBold />}
				rules={[{ required: true, message: 'Please enter Phone Number' }]}
			>
				<Input />
			</Form.Item>

			<Form.Item name="email" label={<FormLabel text="Email" isBold />}>
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
