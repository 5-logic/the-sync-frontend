'use client';

import { Form, Input, Modal, Radio, Select, Space } from 'antd';
import { useEffect } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { isValidVietnamesePhone } from '@/lib/utils/validations';
import { Student, StudentUpdate } from '@/schemas/student';
import { useMajorStore, useStudentStore } from '@/store';

type Props = Readonly<{
	open: boolean;
	student: Student | null;
	onClose: () => void;
}>;

export default function EditStudentDialog({ open, student, onClose }: Props) {
	const [form] = Form.useForm();
	const { updating, updateStudent } = useStudentStore();
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();

	// Fetch majors when dialog opens
	useEffect(() => {
		if (open) {
			fetchMajors();
		}
	}, [open, fetchMajors]);

	// Reset form when dialog opens/closes
	useEffect(() => {
		if (open && student) {
			form.setFieldsValue({
				studentId: student.studentId,
				email: student.email,
				fullName: student.fullName,
				gender: student.gender,
				phoneNumber: student.phoneNumber,
				majorId: student.majorId,
			});
		} else if (!open) {
			form.resetFields();
		}
	}, [open, student, form]);

	const handleSubmit = async () => {
		if (!student) return;

		try {
			const values = await form.validateFields();

			const studentData: StudentUpdate = {
				studentId: values.studentId?.trim().toUpperCase(),
				email: values.email?.trim().toLowerCase(),
				fullName: values.fullName?.trim(),
				gender: values.gender,
				phoneNumber: values.phoneNumber?.trim(),
				majorId: values.majorId,
			};

			const success = await updateStudent(student.id, studentData);
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
			title="Edit Student"
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
					{/* Student ID */}
					<Form.Item
						name="studentId"
						label={<FormLabel text="Student ID" isRequired isBold />}
						rules={[
							{ required: true, message: 'Please enter student ID' },
							{ min: 1, message: 'Student ID cannot be empty' },
							{ max: 8, message: 'Student ID must be at most 8 characters' },
						]}
					>
						<Input placeholder="Enter student ID" />
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
						<Input placeholder="Enter email" />
					</Form.Item>

					{/* Full Name */}
					<Form.Item
						name="fullName"
						label={<FormLabel text="Full Name" isRequired isBold />}
						rules={[
							{ required: true, message: 'Please enter full name' },
							{ min: 1, message: 'Full name cannot be empty' },
							{ max: 100, message: 'Full name is too long' },
						]}
					>
						<Input placeholder="Enter full name" />
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

					{/* Major */}
					<Form.Item
						name="majorId"
						label={<FormLabel text="Major" isRequired isBold />}
						rules={[{ required: true, message: 'Please select major' }]}
					>
						<Select
							placeholder="Select major"
							loading={majorsLoading}
							showSearch
							optionFilterProp="children"
						>
							{majors.map((major) => (
								<Select.Option key={major.id} value={major.id}>
									{major.name} ({major.code})
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Space>
			</Form>
		</Modal>
	);
}
