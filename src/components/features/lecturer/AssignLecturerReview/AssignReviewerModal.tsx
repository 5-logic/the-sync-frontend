'use client';

import { Button, Form, Modal, Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { GroupTableProps } from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import {
	AssignBulkReviewersResult,
	ChangeReviewerResult,
	Lecturer,
} from '@/lib/services/review.service';
import { useReviewStore } from '@/store/useReviewStore';

interface LecturerOption {
	label: string;
	value: string;
}

export interface Props {
	readonly open: boolean;
	readonly loading?: boolean;
	readonly saveDraftLoading?: boolean;
	readonly onCancel: () => void;
	readonly onAssign: (
		result: AssignBulkReviewersResult | ChangeReviewerResult | null,
	) => void;
	readonly onSaveDraft?: (values: string[]) => void;
	readonly initialValues?: string[];
	readonly group: GroupTableProps | null;
	readonly onReloadSubmission?: (submissionId: string) => void;
}

/**
 * Modal component for assigning reviewers to groups
 * Supports both Save Draft and Assign/Change actions
 */
export default function AssignReviewerModal({
	open,
	loading = false,
	saveDraftLoading = false,
	onCancel,
	onAssign,
	onSaveDraft,
	initialValues = [],
	group,
	onReloadSubmission,
}: Props) {
	const [form] = Form.useForm();
	const [eligibleLecturers, setEligibleLecturers] = useState<Lecturer[]>([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [renderKey, setRenderKey] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);
	const [previousOpen, setPreviousOpen] = useState(false);
	const [previousInitialValues, setPreviousInitialValues] = useState<string[]>(
		[],
	);

	// Store actions
	const getEligibleReviewers = useReviewStore((s) => s.getEligibleReviewers);
	const assignBulkReviewers = useReviewStore((s) => s.assignBulkReviewers);
	const changeReviewer = useReviewStore((s) => s.changeReviewer);

	// Watch form values to compute options reactively
	const reviewer1Value = Form.useWatch('reviewer1', form);
	const reviewer2Value = Form.useWatch('reviewer2', form);

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

	const getInitialReviewerValues = () => {
		const reviewerVals =
			group?.reviewers && group.reviewers.length > 0
				? group.reviewers
				: initialValues || [];

		const reviewer1Id =
			typeof reviewerVals[0] === 'string'
				? reviewerVals[0]
				: reviewerVals[0]?.id;
		const reviewer2Id =
			typeof reviewerVals[1] === 'string'
				? reviewerVals[1]
				: reviewerVals[1]?.id;

		return { reviewer1Id, reviewer2Id };
	};

	const initializeForm = () => {
		const { reviewer1Id, reviewer2Id } = getInitialReviewerValues();

		form.setFieldsValue({
			reviewer1: reviewer1Id,
			reviewer2: reviewer2Id,
		});
		setIsInitialized(true);
		setRenderKey((prev) => prev + 1);
	};

	const resetFormInitialization = () => {
		setIsInitialized(false);
	};

	// Fetch eligible lecturers
	useEffect(() => {
		let ignore = false;
		if (open && group?.submissionId) {
			setFetchLoading(true);
			getEligibleReviewers(group.submissionId)
				.then((data) => {
					if (!ignore) setEligibleLecturers(data);
				})
				.catch(() => {
					if (!ignore) setEligibleLecturers([]);
				})
				.finally(() => {
					if (!ignore) setFetchLoading(false);
				});
		} else if (!open) {
			setEligibleLecturers([]);
		}
		return () => {
			ignore = true;
		};
	}, [open, group?.submissionId, getEligibleReviewers]);

	// Initialize form values
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
	}, [open, initialValues, group]);

	// Handle render key updates only when not loading
	useEffect(() => {
		if (open && !loading && isInitialized) {
			setRenderKey((prev) => prev + 1);
		}
	}, [open, loading, isInitialized]);

	// Determine if this is a change operation
	const isChangeMode = Boolean(
		group && group.reviewers && group.reviewers.length > 0,
	);

	// Get current reviewer IDs for change operations
	const getCurrentReviewerIds = (): string[] => {
		if (!isChangeMode) return [];
		const { reviewer1Id, reviewer2Id } = getInitialReviewerValues();
		return [reviewer1Id, reviewer2Id].filter(Boolean) as string[];
	};

	// Generate stable keys for Select components
	const getReviewer1Key = (): string => {
		if (loading || fetchLoading) return 'reviewer1-loading';
		return `reviewer1-${reviewer2Value || 'none'}-${renderKey}`;
	};

	const getReviewer2Key = (): string => {
		if (loading || fetchLoading) return 'reviewer2-loading';
		return `reviewer2-${reviewer1Value || 'none'}-${renderKey}`;
	};

	// Compute reviewer options using useMemo for performance
	const reviewer1Options = useMemo((): LecturerOption[] => {
		const currentReviewer2 = reviewer2Value;
		if (currentReviewer2) {
			return eligibleLecturers
				.filter((lecturer) => lecturer.id !== currentReviewer2)
				.map((lecturer) => ({
					label: lecturer.fullName,
					value: lecturer.id,
				}));
		}
		return eligibleLecturers.map((lecturer) => ({
			label: lecturer.fullName,
			value: lecturer.id,
		}));
	}, [reviewer2Value, eligibleLecturers]);

	const reviewer2Options = useMemo((): LecturerOption[] => {
		const currentReviewer1 = reviewer1Value;
		if (currentReviewer1) {
			return eligibleLecturers
				.filter((lecturer) => lecturer.id !== currentReviewer1)
				.map((lecturer) => ({
					label: lecturer.fullName,
					value: lecturer.id,
				}));
		}
		return eligibleLecturers.map((lecturer) => ({
			label: lecturer.fullName,
			value: lecturer.id,
		}));
	}, [reviewer1Value, eligibleLecturers]);

	// Common filter function for search functionality
	const filterOption = (
		input: string,
		option?: { label: string; value: string },
	) => {
		if (!option?.label) return false;

		const searchText = input.toLowerCase().trim();
		const labelText = option.label.toLowerCase();

		// Support searching by full name
		return labelText.includes(searchText);
	};

	// Modal title methods
	const getModalTitle = (): string => {
		const groupCode = group?.code ?? '';
		if (isChangeMode) {
			return `Change Reviewers for Group: ${groupCode}`;
		}
		return `Assign Reviewers for Group: ${groupCode}`;
	};

	// Handle form submission
	const handleFinish = async () => {
		if (!group?.submissionId) return;

		const values = form.getFieldsValue();
		const selected = [values.reviewer1, values.reviewer2].filter(
			Boolean,
		) as string[];

		if (selected.length < 2) {
			form.setFields([
				{
					name: 'reviewer1',
					errors:
						selected.length === 0
							? ['Please select at least one reviewer']
							: [],
				},
				{
					name: 'reviewer2',
					errors: selected.length < 2 ? ['Please select second reviewer'] : [],
				},
			]);
			return;
		}

		try {
			if (isChangeMode && changeReviewer) {
				await handleChangeReviewers(selected);
			} else if (!isChangeMode && assignBulkReviewers) {
				await handleAssignReviewers(selected);
			}
		} catch (error) {
			console.error('Failed to assign/change reviewers:', error);
		}
	};

	const handleChangeReviewers = async (selected: string[]) => {
		if (!group?.submissionId || !changeReviewer) return;

		const currentReviewerIds = getCurrentReviewerIds();
		if (currentReviewerIds.length !== 2) return;

		const results: ChangeReviewerResult[] = [];
		for (let i = 0; i < 2; i++) {
			if (currentReviewerIds[i] !== selected[i]) {
				const result = await changeReviewer(group.submissionId, {
					currentReviewerId: currentReviewerIds[i],
					newReviewerId: selected[i],
				});
				if (result) results.push(result);
			}
		}

		if (results.length > 0) {
			if (onReloadSubmission) onReloadSubmission(group.submissionId);
			onAssign(results[0]);
		} else {
			onAssign(null);
		}
	};

	const handleAssignReviewers = async (selected: string[]) => {
		if (!group?.submissionId || !assignBulkReviewers) return;

		const result = await assignBulkReviewers({
			assignments: [
				{
					submissionId: group.submissionId,
					lecturerIds: selected,
				},
			],
		});

		if (result) {
			if (onReloadSubmission) onReloadSubmission(group.submissionId);
			onAssign(result);
		} else {
			onAssign(null);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		setIsInitialized(false);
		onCancel();
	};

	const handleSaveDraft = () => {
		if (!onSaveDraft) return;

		const values = form.getFieldsValue();
		const selected = [values.reviewer1, values.reviewer2].filter(Boolean);
		onSaveDraft(selected as string[]);
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

	const getSaveDraftButton = () => (
		<Button
			key="draft"
			onClick={handleSaveDraft}
			loading={saveDraftLoading}
			disabled={loading || saveDraftLoading}
			style={{ marginRight: 8 }}
		>
			Save Draft
		</Button>
	);

	const getSubmitButton = () => (
		<Button
			key="submit"
			type="primary"
			onClick={handleFinish}
			loading={loading}
			disabled={loading || saveDraftLoading}
		>
			{isChangeMode ? 'Change' : 'Assign'}
		</Button>
	);

	const getFooterButtons = () => {
		const buttons = [getCancelButton()];

		if (onSaveDraft && !isChangeMode) {
			buttons.push(getSaveDraftButton());
		}

		buttons.push(getSubmitButton());
		return buttons;
	};

	// Placeholder methods
	const getReviewer1Placeholder = (): string => 'Select reviewer';
	const getReviewer2Placeholder = (): string => 'Select reviewer';

	// Label methods
	const getReviewer1LabelText = (): string => 'Reviewer 1';
	const getReviewer2LabelText = (): string => 'Reviewer 2';

	return (
		<Modal
			title={getModalTitle()}
			open={open}
			onCancel={handleCancel}
			footer={getFooterButtons()}
			centered
		>
			<Form form={form} layout="vertical" requiredMark={false}>
				<Form.Item
					label={<FormLabel text={getReviewer1LabelText()} isRequired isBold />}
					name="reviewer1"
					required={false}
					rules={[
						{
							validator: (_, value) => {
								if (!value) {
									return Promise.resolve(); // Allow empty for save draft
								}
								return Promise.resolve();
							},
						},
					]}
				>
					<Select
						key={getReviewer1Key()}
						placeholder={getReviewer1Placeholder()}
						options={reviewer1Options}
						allowClear
						showSearch
						disabled={loading || fetchLoading}
						filterOption={filterOption}
						optionLabelProp="label"
						optionFilterProp="label"
						value={reviewer1Value}
						dropdownMatchSelectWidth={false}
						onChange={() => {
							form.validateFields(['reviewer2']);
						}}
					/>
				</Form.Item>

				<Form.Item
					label={<FormLabel text={getReviewer2LabelText()} isRequired isBold />}
					name="reviewer2"
					required={false}
					rules={[
						{
							validator(_, value) {
								const reviewer1 =
									reviewer1Value || form.getFieldValue('reviewer1');

								if (value && value === reviewer1) {
									return Promise.reject(
										new Error('Reviewer 2 must be different from Reviewer 1'),
									);
								}

								return Promise.resolve();
							},
						},
					]}
				>
					<Select
						key={getReviewer2Key()}
						placeholder={getReviewer2Placeholder()}
						options={reviewer2Options}
						allowClear
						showSearch
						disabled={loading || fetchLoading}
						filterOption={filterOption}
						optionLabelProp="label"
						optionFilterProp="label"
						value={reviewer2Value}
						dropdownMatchSelectWidth={false}
						onChange={() => {
							form.validateFields(['reviewer1']);
						}}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
