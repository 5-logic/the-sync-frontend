import { Button, Form, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';

interface LecturerOption {
	label: string;
	value: string;
}

interface Props {
	readonly open: boolean;
	readonly loading?: boolean;
	readonly onCancel: () => void;
	readonly onSubmit: (values: string[]) => void;
	readonly initialValues?: string[];
	readonly lecturerOptions: LecturerOption[];
	readonly isChangeMode?: boolean;
}

export default function AssignSupervisorModal({
	open,
	loading = false,
	onCancel,
	onSubmit,
	initialValues = [],
	lecturerOptions,
	isChangeMode = false,
}: Props) {
	const [form] = Form.useForm();
	const [renderKey, setRenderKey] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize form values only once when modal opens
	useEffect(() => {
		if (open && !isInitialized) {
			form.setFieldsValue({
				supervisor1: initialValues?.[0],
				supervisor2: initialValues?.[1],
			});
			setIsInitialized(true);
			setRenderKey((prev) => prev + 1);
		} else if (!open) {
			// Reset initialization flag when modal closes
			setIsInitialized(false);
		}
	}, [open, initialValues, form, isInitialized]);

	// Handle render key updates only when not loading
	useEffect(() => {
		if (open && !loading && isInitialized) {
			setRenderKey((prev) => prev + 1);
		}
	}, [open, loading, isInitialized]);

	const handleCancel = () => {
		// Reset form and initialization flag when canceling
		form.resetFields();
		setIsInitialized(false);
		onCancel();
	};

	const handleFinish = (values: {
		supervisor1?: string;
		supervisor2?: string;
	}) => {
		const selected = [values.supervisor1, values.supervisor2].filter(
			(id): id is string => Boolean(id),
		);

		onSubmit(selected);
	};

	// Filter lecturer options based on mode
	const getAvailableOptions = () => {
		// Both modes now show all lecturers for consistency
		// This provides flexibility and better UX
		return lecturerOptions;
	};

	// Get options for supervisor 1 (exclude supervisor 2 if selected)
	const getSupervisor1Options = () => {
		const baseOptions = getAvailableOptions();
		const supervisor2Value =
			form.getFieldValue('supervisor2') || initialValues?.[1];

		// Always exclude the currently selected supervisor2 to prevent duplicates
		if (supervisor2Value) {
			return baseOptions.filter((option) => option.value !== supervisor2Value);
		}
		return baseOptions;
	};

	// Get options for supervisor 2 (exclude supervisor 1 if selected)
	const getSupervisor2Options = () => {
		const baseOptions = getAvailableOptions();
		const supervisor1Value =
			form.getFieldValue('supervisor1') || initialValues?.[0];

		// Always exclude the currently selected supervisor1 to prevent duplicates
		if (supervisor1Value) {
			return baseOptions.filter((option) => option.value !== supervisor1Value);
		}
		return baseOptions;
	};

	return (
		<Modal
			title={isChangeMode ? 'Change Supervisor' : 'Assign Supervisor'}
			open={open}
			onCancel={handleCancel}
			footer={null}
			centered
		>
			<Form form={form} layout="vertical" onFinish={handleFinish}>
				<Form.Item
					label={
						<FormLabel
							text={`${isChangeMode ? 'Change' : 'Select'} Supervisor 1`}
							isRequired
							isBold
						/>
					}
					name="supervisor1"
					required={false}
					rules={[
						{
							required: true,
							message: 'Please select at least one supervisor',
						},
					]}
				>
					<Select
						key={
							loading
								? 'supervisor1-loading'
								: `supervisor1-${form.getFieldValue('supervisor2') || initialValues?.[1] || 'none'}-${renderKey}`
						}
						placeholder={
							isChangeMode ? 'Change to new supervisor' : 'Select supervisor'
						}
						options={getSupervisor1Options()}
						allowClear
						showSearch
						disabled={loading}
						filterOption={(input, option) =>
							(option?.label?.toString() ?? '')
								.toLowerCase()
								.includes(input.toLowerCase())
						}
						onChange={() => {
							form.validateFields(['supervisor2']);
						}} // Re-validate supervisor2 when supervisor1 changes
					/>
				</Form.Item>

				<Form.Item
					label={
						<FormLabel
							text={`${isChangeMode ? 'Change' : 'Select'} Supervisor 2`}
							isBold
						/>
					}
					name="supervisor2"
					required={false}
					rules={[
						{
							validator(_, value) {
								const sup1 = form.getFieldValue('supervisor1');

								if (value && value === sup1) {
									return Promise.reject(
										new Error(
											'Supervisor 2 must be different from Supervisor 1',
										),
									);
								}

								return Promise.resolve();
							},
						},
					]}
				>
					<Select
						key={
							loading
								? 'supervisor2-loading'
								: `supervisor2-${form.getFieldValue('supervisor1') || initialValues?.[0] || 'none'}-${renderKey}`
						}
						placeholder={
							isChangeMode
								? 'Change to new supervisor (optional)'
								: 'Select supervisor (optional)'
						}
						options={getSupervisor2Options()}
						allowClear
						showSearch
						disabled={loading}
						filterOption={(input, option) =>
							(option?.label?.toString() ?? '')
								.toLowerCase()
								.includes(input.toLowerCase())
						}
						onChange={() => {
							form.validateFields(['supervisor1']);
						}} // Re-validate supervisor1 when supervisor2 changes
					/>
				</Form.Item>

				<Form.Item className="text-right">
					<Button
						onClick={handleCancel}
						style={{ marginRight: 8 }}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button type="primary" htmlType="submit" loading={loading}>
						{isChangeMode ? 'Change' : 'Assign'}
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}
