import { Avatar, Button, Form, Input, Space } from 'antd';

import FormLabel from '@/components/common/FormLabel/FormLabel';
import { Lecturer } from '@/schemas/lecturer';

interface Props {
	readonly lecturer: Lecturer;
}

export default function PersonalInfoForm({ lecturer }: Props) {
	const [form] = Form.useForm();

	return (
		<Form
			layout="vertical"
			form={form}
			requiredMark="optional"
			initialValues={{
				fullName: lecturer.fullName,
				phoneNumber: lecturer.phoneNumber,
				email: lecturer.email,
			}}
		>
			<Space
				direction="vertical"
				align="center"
				style={{ width: '100%', marginBottom: 16 }}
			>
				<Avatar size={80} src="/images/user_avatar.png" />
			</Space>

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

			<div
				style={{
					display: 'flex',
					gap: 8,
					justifyContent: 'flex-end',
				}}
			>
				<Button>Cancel</Button>
				<Button type="primary" htmlType="submit">
					Save Changes
				</Button>
			</div>
		</Form>
	);
}
