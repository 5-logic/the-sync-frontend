'use client';

import { Form, Modal, Space } from 'antd';
import { useEffect } from 'react';

import { PersonFormFields } from '@/components/common/FormFields';
import { useEditDialog } from '@/hooks/ui';
import { Lecturer, LecturerUpdate } from '@/schemas/lecturer';
import { useLecturerStore } from '@/store';

type EditLecturerDialogProps = Readonly<{
	open: boolean;
	lecturer: Lecturer | null;
	onClose: () => void;
}>;

export default function EditLecturerDialog({
	open,
	lecturer,
	onClose,
}: EditLecturerDialogProps) {
	const { updateLecturer, updating } = useLecturerStore();
	const {
		form,
		initializeForm,
		handleCancel,
		handleSubmit,
		isFormChanged,
		handleFormChange,
	} = useEditDialog<Lecturer, LecturerUpdate>({
		onClose,
	});

	// Initialize form when lecturer data is available
	useEffect(() => {
		if (lecturer) {
			initializeForm(lecturer);
		}
	}, [lecturer, initializeForm]);

	// Note: handleCancel from useEditDialog already handles form reset and onClose

	const onSubmit = async (
		values: Partial<LecturerUpdate>,
	): Promise<boolean> => {
		if (!lecturer) return false;

		// Process the changed fields
		const lecturerData: Partial<LecturerUpdate> = {};

		if (values.fullName !== undefined) {
			lecturerData.fullName = values.fullName.trim();
		}
		if (values.email !== undefined) {
			lecturerData.email = values.email.trim().toLowerCase();
		}
		if (values.phoneNumber !== undefined) {
			lecturerData.phoneNumber = values.phoneNumber.trim();
		}
		if (values.gender !== undefined) {
			lecturerData.gender = values.gender;
		}

		return await updateLecturer(lecturer.id, lecturerData as LecturerUpdate);
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
