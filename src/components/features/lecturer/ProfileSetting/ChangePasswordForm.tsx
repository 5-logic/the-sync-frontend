import { Button, Form, Input, Typography } from 'antd';

import FormLabel from '@/components/common/FormLabel/FormLabel';

export default function ChangePasswordForm() {
	const [form] = Form.useForm();

	return (
		<Form
			layout="vertical"
			requiredMark="optional"
			form={form}
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
			}}
		>
			<div style={{ flex: 1 }}>
				<Form.Item
					name="currentPassword"
					label={<FormLabel text="Current Password" isRequired isBold />}
					rules={[{ required: true, message: 'Please enter Current Password' }]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item
					name="newPassword"
					label={<FormLabel text="New Password" isRequired isBold />}
					rules={[{ required: true, message: 'Please enter New Password' }]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item
					name="confirmPassword"
					label={<FormLabel text="Confirm New Password" isRequired isBold />}
					dependencies={['newPassword']}
					rules={[
						{ required: true, message: 'Please enter Confirm New Password' },
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
			</div>

			<div
				style={{
					paddingTop: 14,
					display: 'flex',
					gap: 8,
					justifyContent: 'flex-end',
				}}
			>
				<Button>Cancel</Button>
				<Button type="primary" htmlType="submit">
					Update Password
				</Button>
			</div>
		</Form>
	);
}
