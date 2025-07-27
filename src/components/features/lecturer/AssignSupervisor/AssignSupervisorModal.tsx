import { Button, Form, Modal, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';

interface LecturerOption {
	label: string;
	value: string;
}

interface Props {
	readonly open: boolean;
	readonly loading?: boolean; // For assign now button
	readonly saveDraftLoading?: boolean; // For save draft button
	readonly onCancel: () => void;
	readonly onSaveDraft: (values: string[]) => void;
	readonly onAssignNow: (values: string[]) => void;
	readonly initialValues?: string[];
	readonly lecturerOptions: LecturerOption[];
	readonly showAssignNow?: boolean; // Show assign now button when appropriate
	readonly isChangeMode?: boolean; // True when editing finalized assignments
}

/**
 * Modal component for assigning supervisors
 * Now supports both Save Draft and Assign Now actions
 */

export default function AssignSupervisorModal({
	open,
	loading = false,
	saveDraftLoading = false,
	onCancel,
	onSaveDraft,
	onAssignNow,
	initialValues = [],
	lecturerOptions,
	showAssignNow = false,
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

		// Default to save draft - will be overridden by button clicks
		onSaveDraft(selected);
	};

	const handleSaveDraft = () => {
		// For save draft, we don't need strict validation
		// Just get current form values without validation
		const values = form.getFieldsValue();
		const selected = [values.supervisor1, values.supervisor2].filter(
			(id): id is string => Boolean(id),
		);

		// Allow saving draft even with empty selection
		onSaveDraft(selected);
	};

	const handleAssignNow = () => {
		// Validate form before proceeding
		form
			.validateFields()
			.then((values) => {
				const selected = [values.supervisor1, values.supervisor2].filter(
					(id): id is string => Boolean(id),
				);

				// In change mode, require both supervisors
				if (isChangeMode && selected.length < 2) {
					if (!values.supervisor1) {
						form.setFields([
							{
								name: 'supervisor1',
								errors: ['Please select supervisor 1'],
							},
						]);
					}
					if (!values.supervisor2) {
						form.setFields([
							{
								name: 'supervisor2',
								errors: ['Please select supervisor 2'],
							},
						]);
					}
					return;
				}

				if (!isChangeMode && selected.length === 0) {
					form.setFields([
						{
							name: 'supervisor1',
							errors: ['Please select at supervisor 1'],
						},
					]);
					return;
				}

				onAssignNow(selected);
			})
			.catch(() => {
				// Form validation failed, errors will be shown automatically
			});
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

	// Watch form values to compute options reactively
	const supervisor1Value = Form.useWatch('supervisor1', form);
	const supervisor2Value = Form.useWatch('supervisor2', form);

	// Detect if there are changes from initial values
	const hasChanges = useMemo(() => {
		const currentValues = [supervisor1Value, supervisor2Value].filter(Boolean);
		const initial = initialValues.filter(Boolean);

		// Check if values are different
		if (currentValues.length !== initial.length) return true;

		// Check if any value changed
		return (
			currentValues.some((value, index) => value !== initial[index]) ||
			initial.some((value, index) => value !== currentValues[index])
		);
	}, [supervisor1Value, supervisor2Value, initialValues]);

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

	// No more locking logic - always allow assignment
	// Users can assign to any position, system will handle change vs assign logic

	// Extract placeholder logic for supervisor 2
	const getSupervisor2Placeholder = (): string => {
		return 'Select supervisor';
	};

	// Extract placeholder logic for supervisor 1
	const getSupervisor1Placeholder = (): string => {
		return 'Select supervisor';
	};

	// Modal title methods - multiple approaches for determining title
	const getChangeModeTitle = (): string => 'Change Supervisor';

	const getAssignModeTitle = (): string => 'Assign Supervisor';

	const getTitleForExistingSupervisors = (): string => {
		return getChangeModeTitle();
	};

	const getTitleForNewAssignment = (): string => {
		return getAssignModeTitle();
	};

	const getTitleByInitialValues = (): string => {
		const hasExistingSupervisors =
			initialValues &&
			initialValues.length > 0 &&
			initialValues.some((value) => Boolean(value));

		if (hasExistingSupervisors) {
			return getTitleForExistingSupervisors();
		}
		return getTitleForNewAssignment();
	};

	const getTitleForChangeMode = (): string => {
		return getChangeModeTitle();
	};

	const getTitleForAssignMode = (): string => {
		return getAssignModeTitle();
	};

	const getTitleByModeFlag = (): string => {
		if (isChangeMode) {
			return getTitleForChangeMode();
		}
		return getTitleForAssignMode();
	};

	const getModalTitle = (): string => {
		// Multiple methods available for determining title:

		// Method 1: Use the existing isChangeMode flag (primary method for backward compatibility)
		if (isChangeMode) {
			return getTitleByModeFlag();
		}

		// Method 2: Determine by checking if there are existing supervisor assignments
		return getTitleByInitialValues();
	};

	// Extract label text logic - simplified
	const getSupervisor1LabelText = (): string => {
		return 'Select Supervisor 1';
	};

	const getSupervisor2LabelText = (): string => {
		return 'Select Supervisor 2';
	};

	// Footer button methods
	const getCancelButton = () => (
		<Button
			key="cancel"
			onClick={handleCancel}
			disabled={loading || saveDraftLoading}
		>
			Cancel
		</Button>
	);

	const getChangeButton = () => (
		<Button
			key="change"
			type="primary"
			onClick={handleAssignNow}
			loading={loading}
			disabled={loading || saveDraftLoading || !hasChanges}
		>
			Change
		</Button>
	);

	const getSaveDraftButton = () => (
		<Button
			key="draft"
			onClick={handleSaveDraft}
			loading={saveDraftLoading}
			disabled={loading || saveDraftLoading}
		>
			Save Draft
		</Button>
	);

	const getAssignNowButton = () => (
		<Button
			key="assign"
			type="primary"
			onClick={handleAssignNow}
			loading={loading}
			disabled={loading || saveDraftLoading}
		>
			Assign Now
		</Button>
	);

	const getChangeModeFooter = () => [getCancelButton(), getChangeButton()];

	const getAssignModeFooterWithAssignNow = () => [
		getCancelButton(),
		getSaveDraftButton(),
		getAssignNowButton(),
	];

	const getAssignModeFooterWithoutAssignNow = () => [
		getCancelButton(),
		getSaveDraftButton(),
	];

	const getAssignModeFooter = () => {
		if (showAssignNow) {
			return getAssignModeFooterWithAssignNow();
		}
		return getAssignModeFooterWithoutAssignNow();
	};

	const getFooterButtons = () => {
		if (isChangeMode) {
			return getChangeModeFooter();
		}
		return getAssignModeFooter();
	};

	// Helper methods for determining field requirements
	const isFieldRequiredInChangeMode = (): boolean => {
		return true; // Make both supervisors required in change mode
	};

	const isFieldRequiredInAssignMode = (): boolean => {
		return true; // Make supervisor1 required in assign mode
	};

	const isSupervisor1Required = (): boolean => {
		if (isChangeMode) {
			return isFieldRequiredInChangeMode();
		}
		return isFieldRequiredInAssignMode();
	};

	const isSupervisor2Required = (): boolean => {
		if (isChangeMode) {
			return isFieldRequiredInChangeMode(); // Also require supervisor2 in change mode
		}
		return false; // Not required in assign mode
	};

	return (
		<Modal
			title={getModalTitle()}
			open={open}
			onCancel={handleCancel}
			footer={getFooterButtons()}
			centered
		>
			<Form form={form} layout="vertical" onFinish={handleFinish}>
				<Form.Item
					label={
						<FormLabel
							text={getSupervisor1LabelText()}
							isRequired={isSupervisor1Required()}
							isBold
						/>
					}
					name="supervisor1"
					required={false}
					rules={[
						{
							required: isSupervisor1Required(),
							message: 'Please select supervisor 1',
						},
					]}
				>
					<Select
						key={getSupervisor1Key()}
						placeholder={getSupervisor1Placeholder()}
						options={supervisor1Options}
						allowClear
						showSearch
						disabled={loading}
						filterOption={filterOption}
						onChange={() => {
							form.validateFields(['supervisor2']);
						}}
					/>
				</Form.Item>

				<Form.Item
					label={
						<FormLabel
							text={getSupervisor2LabelText()}
							isRequired={isSupervisor2Required()}
							isBold
						/>
					}
					name="supervisor2"
					required={false}
					rules={[
						{
							required: isSupervisor2Required(),
							message: 'Please select supervisor 2',
						},
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
						placeholder={getSupervisor2Placeholder()}
						options={supervisor2Options}
						allowClear
						showSearch
						disabled={loading}
						filterOption={filterOption}
						onChange={() => {
							form.validateFields(['supervisor1']);
						}}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
