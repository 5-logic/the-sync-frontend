'use client';

import { Form, Modal, Space } from 'antd';

import { PersonFormFields } from '@/components/common/FormFields';
import { useEditDialog } from '@/hooks/ui';
import { Lecturer, LecturerUpdate } from '@/schemas/lecturer';
import { useLecturerStore } from '@/store';

interface EditLecturerDialogProps {
	open: boolean;
	lecturer: Lecturer | null;
	onClose: () => void;
}

export default function EditLecturerDialog({
	open,
	lecturer,
	onClose,
}: EditLecturerDialogProps) {
	const { updateLecturer, updating } = useLecturerStore();
	const { form, handleCancel, handleSubmit } = useEditDialog({
		open,
		entity: lecturer,
		onClose,
	});

	const onSubmit = async (values: LecturerUpdate): Promise<boolean> => {
		if (!lecturer) return false;

		const lecturerData: LecturerUpdate = {
			fullName: values.fullName?.trim(),
			email: values.email?.trim().toLowerCase(),
			phoneNumber: values.phoneNumber?.trim(),
			gender: values.gender,
		};

		return await updateLecturer(lecturer.id, lecturerData);
	};

	return (
		<Modal
			title="Edit Lecturer"
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
					<PersonFormFields
						fullNameRules={[
							{ required: true, message: 'Please enter full name' },
							{ min: 2, message: 'Name must be at least 2 characters' },
							{ max: 100, message: 'Full name is too long' },
						]}
					/>
				</Space>
			</Form>
		</Modal>
	);
}
