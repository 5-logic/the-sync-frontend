'use client';

import { Form, Input, Modal, Select, Space } from 'antd';
import { useEffect } from 'react';

import { PersonFormFields } from '@/components/common/FormFields';
import { FormLabel } from '@/components/common/FormLabel';
import { useEditDialog } from '@/hooks/ui';
import { Student, StudentUpdate } from '@/schemas/student';
import { useMajorStore, useStudentStore } from '@/store';

type EditStudentDialogProps = Readonly<{
	open: boolean;
	student: Student | null;
	onClose: () => void;
}>;

export default function EditStudentDialog({
	open,
	student,
	onClose,
}: EditStudentDialogProps) {
	const { updating, updateStudent } = useStudentStore();
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();
	const {
		form,
		initializeForm,
		handleCancel,
		handleSubmit,
		isFormChanged,
		handleFormChange,
	} = useEditDialog<Student, StudentUpdate>({
		onClose,
	});

	// Fetch majors when dialog opens
	useEffect(() => {
		if (open) {
			fetchMajors();
		}
	}, [open, fetchMajors]);

	// Initialize form when student data is available
	useEffect(() => {
		if (student) {
			initializeForm(student);
		}
	}, [student, initializeForm]);

	const onSubmit = async (values: Partial<StudentUpdate>): Promise<boolean> => {
		if (!student) return false;

		// Process the changed fields
		const studentData: Partial<StudentUpdate> = {};

		if (values.studentCode !== undefined) {
			studentData.studentCode = values.studentCode.trim().toUpperCase();
		}
		if (values.email !== undefined) {
			studentData.email = values.email.trim().toLowerCase();
		}
		if (values.fullName !== undefined) {
			studentData.fullName = values.fullName.trim();
		}
		if (values.gender !== undefined) {
			studentData.gender = values.gender;
		}
		if (values.phoneNumber !== undefined) {
			studentData.phoneNumber = values.phoneNumber.trim();
		}
		if (values.majorId !== undefined) {
			studentData.majorId = values.majorId;
		}

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
			okButtonProps={{
				disabled: !isFormChanged,
			}}
		>
			<Form
				form={form}
				layout="vertical"
				requiredMark={false}
				autoComplete="off"
				onValuesChange={handleFormChange}
			>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					{/* Student Code */}
					<Form.Item
						name="studentCode"
						label={<FormLabel text="Student Code" isRequired isBold />}
						rules={[
							{ required: true, message: 'Please enter Student Code' },
							{
								pattern: /^[A-Za-z]{2}\d{6}$/,
								message:
									'Student Code must be 2 letters followed by 6 digits, e.g. QE123456',
							},
						]}
					>
						<Input placeholder="Enter Student Code" />
					</Form.Item>

					{/* Common Person Fields */}
					<PersonFormFields
						fullNameRules={[
							{ required: true, message: 'Please enter full name' },
							{ min: 2, message: 'Full name must be at least 2 characters' },
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
