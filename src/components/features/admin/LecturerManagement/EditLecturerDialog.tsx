'use client';

import {
	Button,
	Col,
	Form,
	Input,
	Modal,
	Radio,
	Row,
	Space,
	Typography,
} from 'antd';
import { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { isValidVietnamesePhone } from '@/lib/utils/validations';
import { Lecturer } from '@/schemas/lecturer';
import { useLecturerStore } from '@/store';

const { Title } = Typography;

interface EditLecturerDialogProps {
	open: boolean;
	lecturer: Lecturer | null;
	onClose: () => void;
}

interface EditLecturerFormData {
	fullName: string;
	email: string;
	phoneNumber: string;
	gender: string;
}

export default function EditLecturerDialog({
	open,
	lecturer,
	onClose,
}: EditLecturerDialogProps) {
	const [form] = Form.useForm<EditLecturerFormData>();
	const { updateLecturer, updating } = useLecturerStore();

	// Reset form when dialog opens or lecturer changes
	useEffect(() => {
		if (open && lecturer) {
			form.setFieldsValue({
				fullName: lecturer.fullName,
				email: lecturer.email,
				phoneNumber: lecturer.phoneNumber,
				gender: lecturer.gender,
			});
		} else if (!open) {
			form.resetFields();
		}
	}, [open, lecturer, form]);

	const handleSubmit = async () => {
		if (!lecturer) return;

		try {
			const values = await form.validateFields();

			const lecturerData: EditLecturerFormData = {
				fullName: values.fullName?.trim(),
				email: values.email?.trim().toLowerCase(),
				phoneNumber: values.phoneNumber?.trim(),
				gender: values.gender,
			};

			const success = await updateLecturer(lecturer.id, lecturerData);
			if (success) {
				onClose();
			}
		} catch (error) {
			console.error('Form validation failed:', error);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};

	return (
		<Modal
			title="Edit Lecturer"
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={updating}
			okText="Update"
			cancelText="Cancel"
			width={500}
			destroyOnClose
			centered
		>
			<Form
				form={form}
				layout="vertical"
				requiredMark={false}
				autoComplete="off"
			>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					{/* Full Name */}
					<Form.Item
						name="fullName"
						label={<FormLabel text="Full Name" isRequired isBold />}
						rules={[
							{ required: true, message: 'Please enter full name' },
							{ min: 2, message: 'Name must be at least 2 characters' },
							{ max: 100, message: 'Full name is too long' },
						]}
					>
						<Input placeholder="Enter full name" />
					</Form.Item>

					{/* Email */}
					<Form.Item
						name="email"
						label={<FormLabel text="Email" isRequired isBold />}
						rules={[
							{ required: true, message: 'Please enter email' },
							{ type: 'email', message: 'Please enter a valid email' },
						]}
					>
						<Input placeholder="Enter email address" />
					</Form.Item>

					{/* Phone Number */}
					<Form.Item
						name="phoneNumber"
						label={<FormLabel text="Phone Number" isRequired isBold />}
						rules={[
							{ required: true, message: 'Please enter phone number' },
							{
								validator: (_, value) => {
									if (!value) return Promise.resolve();
									if (isValidVietnamesePhone(value)) {
										return Promise.resolve();
									}
									return Promise.reject(
										new Error('Please enter a valid Vietnamese phone number'),
									);
								},
							},
						]}
					>
						<Input placeholder="Enter Vietnamese phone number (e.g., 0901234567)" />
					</Form.Item>

					{/* Gender */}
					<Form.Item
						name="gender"
						label={<FormLabel text="Gender" isRequired isBold />}
						rules={[{ required: true, message: 'Please select gender' }]}
					>
						<Radio.Group>
							<Radio value="Male">Male</Radio>
							<Radio value="Female">Female</Radio>
						</Radio.Group>
					</Form.Item>
				</Space>
			</Form>
		</Modal>
	);
}
