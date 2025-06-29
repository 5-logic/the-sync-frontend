import { Form } from 'antd';
import { useEffect } from 'react';

interface UseEditDialogProps<T> {
	open: boolean;
	entity: T | null;
	onClose: () => void;
}

export function useEditDialog<T>({
	open,
	entity,
	onClose,
}: UseEditDialogProps<T>) {
	const [form] = Form.useForm();

	// Reset form when dialog opens/closes
	useEffect(() => {
		if (open && entity) {
			form.setFieldsValue(entity);
		} else if (!open) {
			form.resetFields();
		}
	}, [open, entity, form]);

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};

	const handleSubmit = async (onSubmit: (values: any) => Promise<boolean>) => {
		try {
			const values = await form.validateFields();
			const success = await onSubmit(values);
			if (success) {
				onClose();
			}
		} catch (error) {
			console.error('Form validation failed:', error);
		}
	};

	return {
		form,
		handleCancel,
		handleSubmit,
	};
}
