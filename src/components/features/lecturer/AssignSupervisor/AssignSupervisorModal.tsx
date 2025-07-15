import { Button, Form, Modal, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';

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

/**
 * Modal component for assigning or changing supervisors
 */

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
	const [previousOpen, setPreviousOpen] = useState(false);
	const [previousInitialValues, setPreviousInitialValues] = useState<string[]>(
		[],
	);

	// Helper methods for form initialization
	const shouldInitializeForm = (): boolean => {
		return open && !isInitialized;
	};

	const shouldResetForm = (): boolean => {
		return !open && previousOpen && isInitialized;
	};

	const shouldReinitializeForm = (): boolean => {
		return (
			open &&
			isInitialized &&
			(initialValues[0] !== previousInitialValues[0] ||
				initialValues[1] !== previousInitialValues[1])
		);
	};

	const initializeForm = () => {
		form.setFieldsValue({
			supervisor1: initialValues?.[0],
			supervisor2: initialValues?.[1],
		});
		setIsInitialized(true);
		setRenderKey((prev) => prev + 1);
	};

	const resetFormInitialization = () => {
		setIsInitialized(false);
	};

	// Initialize form values using multiple methods
	useEffect(() => {
		let actionTaken = false;

		if (shouldInitializeForm() || shouldReinitializeForm()) {
			initializeForm();
			actionTaken = true;
		} else if (shouldResetForm()) {
			resetFormInitialization();
			actionTaken = true;
		}

		// Update tracking state only if an action was taken or state changed
		if (
			actionTaken ||
			open !== previousOpen ||
			initialValues[0] !== previousInitialValues[0] ||
			initialValues[1] !== previousInitialValues[1]
		) {
			setPreviousOpen(open);
			setPreviousInitialValues([...initialValues]);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, initialValues]);

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

	// Generate stable keys for Select components using watched values
	const getSupervisor1Key = (): string => {
		if (loading) return 'supervisor1-loading';
		return `supervisor1-${supervisor2Value || 'none'}-${renderKey}`;
	};

	const getSupervisor2Key = (): string => {
		if (loading) return 'supervisor2-loading';
		return `supervisor2-${supervisor1Value || 'none'}-${renderKey}`;
	};

	// Filter lecturer options based on mode	// Watch form values to compute options reactively
	const supervisor1Value = Form.useWatch('supervisor1', form);
	const supervisor2Value = Form.useWatch('supervisor2', form);

	// Compute supervisor 1 options (exclude supervisor 2 if selected)
	const supervisor1Options = useMemo((): LecturerOption[] => {
		const currentSupervisor2 = supervisor2Value || initialValues?.[1];

		// Always exclude the currently selected supervisor2 to prevent duplicates
		if (currentSupervisor2) {
			return lecturerOptions.filter(
				(option: LecturerOption) => option.value !== currentSupervisor2,
			);
		}
		return lecturerOptions;
	}, [supervisor2Value, initialValues, lecturerOptions]);

	// Compute supervisor 2 options (exclude supervisor 1 if selected)
	const supervisor2Options = useMemo((): LecturerOption[] => {
		const currentSupervisor1 = supervisor1Value || initialValues?.[0];

		// Always exclude the currently selected supervisor1 to prevent duplicates
		if (currentSupervisor1) {
			return lecturerOptions.filter(
				(option: LecturerOption) => option.value !== currentSupervisor1,
			);
		}
		return lecturerOptions;
	}, [supervisor1Value, initialValues, lecturerOptions]);

	// Common filter function for search functionality
	const filterOption = (
		input: string,
		option?: { label: string; value: string },
	) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

	// Check if supervisors are already assigned (for locking logic)
	// Lock supervisor 1 only if it's assigned and supervisor 2 is not assigned (allow assigning supervisor 2)
	// Lock supervisor 2 if it's already assigned
	const isSupervisor1Assigned = Boolean(initialValues?.[0]) && !isChangeMode;
	const isSupervisor2Assigned = Boolean(initialValues?.[1]) && !isChangeMode;
	const shouldLockSupervisor1 = isSupervisor1Assigned && !isSupervisor2Assigned;

	return (
		<Modal
			title={isChangeMode ? 'Change Supervisor' : 'Assign Supervisor (Draft)'}
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
						key={getSupervisor1Key()}
						placeholder={
							shouldLockSupervisor1
								? 'Already assigned'
								: isChangeMode
									? 'Change to new supervisor'
									: 'Select supervisor'
						}
						options={supervisor1Options}
						allowClear
						showSearch
						disabled={loading || shouldLockSupervisor1}
						filterOption={filterOption}
						onChange={() => {
							form.validateFields(['supervisor2']);
						}}
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
								const sup1 =
									supervisor1Value || form.getFieldValue('supervisor1');

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
						key={getSupervisor2Key()}
						placeholder={
							isSupervisor2Assigned
								? 'Already assigned'
								: isChangeMode
									? 'Change to new supervisor (optional)'
									: 'Select supervisor (optional)'
						}
						options={supervisor2Options}
						allowClear
						showSearch
						disabled={loading || isSupervisor2Assigned}
						filterOption={filterOption}
						onChange={() => {
							form.validateFields(['supervisor1']);
						}}
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
						{isChangeMode ? 'Change' : 'Save as Draft'}
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}
