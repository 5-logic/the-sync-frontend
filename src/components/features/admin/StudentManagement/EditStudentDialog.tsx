'use client';

import { Form, Input, Modal, Select, Space } from 'antd';
import { useEffect } from 'react';

import { PersonFormFields } from '@/components/common/FormFields';
import { FormLabel } from '@/components/common/FormLabel';
import { useEditDialog } from '@/hooks/ui';
import { Student, StudentUpdate } from '@/schemas/student';
import { useMajorStore, useStudentStore } from '@/store';

type Props = Readonly<{
	open: boolean;
	student: Student | null;
	onClose: () => void;
}>;

export default function EditStudentDialog({ open, student, onClose }: Props) {
	const { updating, updateStudent } = useStudentStore();
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();
	const { form, handleCancel, handleSubmit } = useEditDialog({
		open,
		entity: student,
		onClose,
	});

	// Fetch majors when dialog opens
	useEffect(() => {
		if (open) {
			fetchMajors();
		}
	}, [open, fetchMajors]);

	const onSubmit = async (values: StudentUpdate): Promise<boolean> => {
		if (!student) return false;

		const studentData: StudentUpdate = {
			studentId: values.studentId?.trim().toUpperCase(),
			email: values.email?.trim().toLowerCase(),
			fullName: values.fullName?.trim(),
			gender: values.gender,
			phoneNumber: values.phoneNumber?.trim(),
			majorId: values.majorId,
		};

		return await updateStudent(student.id, studentData);
	};

	return (
		<Modal
			title="Edit Student"
			open={open}
			onOk={() => handleSubmit(onSubmit)}
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

					{/* Common Person Fields */}
					<PersonFormFields
						fullNameRules={[
							{ required: true, message: 'Please enter full name' },
							{ min: 1, message: 'Full name cannot be empty' },
							{ max: 100, message: 'Full name is too long' },
						]}
						emailRules={[
							{ required: true, message: 'Please enter email' },
							{ type: 'email', message: 'Please enter a valid email' },
						]}
					/>

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
