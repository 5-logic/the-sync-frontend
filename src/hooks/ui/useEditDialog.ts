import { Form } from 'antd';
import { useCallback, useEffect } from 'react';

interface UseEditDialogProps {
	onClose: () => void;
}

export function useEditDialog<T, F = Record<string, unknown>>({
	onClose,
}: UseEditDialogProps) {
	const [form] = Form.useForm();

	// Separate method to initialize form with entity data
	const initializeForm = useCallback(
		(entity: T) => {
			form.setFieldsValue(entity);
		},
		[form],
	);

	// Separate method to reset form
	const resetForm = useCallback(() => {
		form.resetFields();
	}, [form]);

	// Clean up form when component unmounts
	useEffect(() => {
		return () => {
			form.resetFields();
		};
	}, [form]);

	const handleCancel = useCallback(() => {
		resetForm();
		onClose();
	}, [resetForm, onClose]);

	const handleSubmit = useCallback(
		async (onSubmit: (values: F) => Promise<boolean>) => {
			try {
				const values = await form.validateFields();
				const success = await onSubmit(values);
				if (success) {
					resetForm();
					onClose();
				}
			} catch (error) {
				console.error('Form validation failed:', error);
			}
		},
		[form, resetForm, onClose],
	);

	return {
		form,
		initializeForm,
		resetForm,
		handleCancel,
		handleSubmit,
	};
}
