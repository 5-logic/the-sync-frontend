import { Form } from 'antd';
import { useCallback, useEffect, useState } from 'react';

interface UseEditDialogProps {
	onClose: () => void;
}

export function useEditDialog<T, F = Record<string, unknown>>({
	onClose,
}: UseEditDialogProps) {
	const [form] = Form.useForm();
	const [originalData, setOriginalData] = useState<T | null>(null);
	const [isFormChanged, setIsFormChanged] = useState(false);

	// Separate method to initialize form with entity data
	const initializeForm = useCallback(
		(entity: T) => {
			form.setFieldsValue(entity);
			setOriginalData(entity);
			setIsFormChanged(false);
		},
		[form],
	);

	// Separate method to reset form
	const resetForm = useCallback(() => {
		form.resetFields();
		setOriginalData(null);
		setIsFormChanged(false);
	}, [form]);

	// Check for changes in form values
	const handleFormChange = useCallback(() => {
		if (!originalData) return;

		const currentValues = form.getFieldsValue();
		const originalDataRecord = originalData as Record<string, unknown>;
		const hasChanges = Object.keys(originalDataRecord).some(
			(key) => currentValues[key] !== originalDataRecord[key],
		);
		setIsFormChanged(hasChanges);
	}, [form, originalData]);

	// Clean up form when component unmounts
	useEffect(() => {
		return () => {
			form.resetFields();
			setOriginalData(null);
			setIsFormChanged(false);
		};
	}, [form]);

	const handleCancel = useCallback(() => {
		resetForm();
		onClose();
	}, [resetForm, onClose]);

	const handleSubmit = useCallback(
		async (onSubmit: (values: Partial<F>) => Promise<boolean>) => {
			try {
				const values = await form.validateFields();

				// Only include changed fields
				const changedFields: Partial<F> = {};
				if (originalData) {
					const originalDataRecord = originalData as Record<string, unknown>;
					Object.keys(values).forEach((key) => {
						if (values[key] !== originalDataRecord[key]) {
							(changedFields as Record<string, unknown>)[key] = values[key];
						}
					});
				}

				// Only proceed if there are actual changes
				if (Object.keys(changedFields).length === 0) {
					resetForm();
					onClose();
					return;
				}

				const success = await onSubmit(changedFields);
				if (success) {
					resetForm();
					onClose();
				}
			} catch (error) {
				console.error('Form validation failed:', error);
			}
		},
		[form, resetForm, onClose, originalData],
	);

	return {
		form,
		initializeForm,
		resetForm,
		handleCancel,
		handleSubmit,
		isFormChanged,
		handleFormChange,
	};
}
