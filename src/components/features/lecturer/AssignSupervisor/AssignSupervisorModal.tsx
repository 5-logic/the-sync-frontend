import { Alert, Button, Form, Modal, Select, Spin } from 'antd';
import React, { useEffect } from 'react';

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
	readonly currentSupervisorIds?: string[]; // Add this to track current supervisors
}

export default function AssignSupervisorModal({
	open,
	loading = false,
	onCancel,
	onSubmit,
	initialValues = [],
	lecturerOptions,
	isChangeMode = false,
	currentSupervisorIds = [],
}: Props) {
	const [form] = Form.useForm();

	useEffect(() => {
		if (open) {
			form.setFieldsValue({
				supervisor1: initialValues?.[0],
				supervisor2: initialValues?.[1],
			});
		}
	}, [open, initialValues, form]);

	const handleCancel = () => {
		// Reset form when canceling
		form.resetFields();
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
		if (isChangeMode) {
			// In change mode, allow all lecturers except the currently selected ones in the form
			// This prevents selecting the same lecturer for both positions
			return lecturerOptions;
		} else {
			// In assign mode, filter out supervisors already assigned to this thesis
			return lecturerOptions.filter(
				(option) => !currentSupervisorIds.includes(option.value),
			);
		}
	};

	// Get options for supervisor 1 (exclude supervisor 2 if selected)
	const getSupervisor1Options = () => {
		const baseOptions = getAvailableOptions();
		const supervisor2Value = form.getFieldValue('supervisor2');

		// Always exclude the currently selected supervisor2 to prevent duplicates
		if (supervisor2Value) {
			return baseOptions.filter((option) => option.value !== supervisor2Value);
		}
		return baseOptions;
	};

	// Get options for supervisor 2 (exclude supervisor 1 if selected)
	const getSupervisor2Options = () => {
		const baseOptions = getAvailableOptions();
		const supervisor1Value = form.getFieldValue('supervisor1');

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
			<Spin spinning={loading}>
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						supervisor1: initialValues[0],
						supervisor2: initialValues[1],
					}}
					onFinish={handleFinish}
				>
					{!isChangeMode && currentSupervisorIds.length > 0 && (
						<Alert
							message="Information"
							description={`This thesis already has ${currentSupervisorIds.length} supervisor(s) assigned. Only available lecturers are shown.`}
							type="info"
							style={{ marginBottom: 16 }}
							showIcon
						/>
					)}
					<Form.Item
						label={<FormLabel text="Select Supervisor 1" isRequired isBold />}
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
							key={`supervisor1-${form.getFieldValue('supervisor2') || 'none'}`}
							placeholder="Select supervisor"
							options={getSupervisor1Options()}
							allowClear
							showSearch
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
						label={<FormLabel text="Select Supervisor 2" isBold />}
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
							key={`supervisor2-${form.getFieldValue('supervisor1') || 'none'}`}
							placeholder="Select supervisor (optional)"
							options={getSupervisor2Options()}
							allowClear
							showSearch
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
			</Spin>
		</Modal>
	);
}
