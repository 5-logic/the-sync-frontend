import { Button, Form, Input, Space, Typography } from 'antd';

export default function ChangePasswordForm() {
	const [form] = Form.useForm();

	return (
		<Form layout="vertical" form={form}>
			<Form.Item
				label="Current Password"
				name="currentPassword"
				rules={[{ required: true }]}
			>
				<Input.Password />
			</Form.Item>

			<Form.Item
				label="New Password"
				name="newPassword"
				rules={[{ required: true }]}
			>
				<Input.Password />
			</Form.Item>

			<Form.Item
				label="Confirm New Password"
				name="confirmPassword"
				dependencies={['newPassword']}
				rules={[
					{ required: true },
					({ getFieldValue }) => ({
						validator(_, value) {
							if (!value || getFieldValue('newPassword') === value) {
								return Promise.resolve();
							}
							return Promise.reject(new Error('Passwords do not match'));
						},
					}),
				]}
			>
				<Input.Password />
			</Form.Item>

			<Typography.Text type="secondary" className="block mb-4">
				Password must be at least 8 characters long and include uppercase,
				lowercase, numbers and special characters.
			</Typography.Text>

			<Space>
				<Button>Cancel</Button>
				<Button type="primary" htmlType="submit">
					Update Password
				</Button>
			</Space>
		</Form>
	);
}
