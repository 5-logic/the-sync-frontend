'use client';

import { Button, Form, Modal, Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { GroupTableProps } from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import {
	AssignBulkReviewersResult,
	Lecturer,
} from '@/lib/services/review.service';
import { showNotification } from '@/lib/utils/notification';
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
	readonly onAssign: (result: AssignBulkReviewersResult | null) => void;
	readonly onSaveDraft?: (
		mainReviewerId?: string,
		secondaryReviewerId?: string,
	) => void;
	readonly initialValues?: string[];
	readonly group: GroupTableProps | null;
	readonly onReloadSubmission?: (submissionId: string) => void;
}

/**
 * Modal component for assigning reviewers to groups
 *
 * Key Features:
 * - Uses eligible reviewers API (/reviews/{submissionId}/eligible-reviewers) for smart filtering
 * - API automatically excludes supervisors and already assigned reviewers
 * - Supports both new assignment and change reviewer operations using bulk assign API
 * - Main reviewer (isMainReviewer: true) and Secondary reviewer (isMainReviewer: false)
 * - In change mode, shows currently assigned reviewers alongside eligible ones
 * - Prevents duplicate selections between main and secondary reviewers
 * - Save draft functionality with proper validation
 *
 * Business Logic:
 * - Both Assign and Change Mode: Uses bulk assign API (POST /reviews/assign-reviewer) for all operations
 * - Assign Mode: Uses eligible reviewers API to get available lecturers
 * - Change Mode: Merges current reviewers with eligible reviewers for complete display
 * - Validation: Ensures main and secondary reviewers are different
 * - API Integration: Uses bulk assignment format with reviewer roles for both assign and change operations
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
	const [currentReviewers, setCurrentReviewers] = useState<Lecturer[]>([]);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [renderKey, setRenderKey] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);
	const [previousOpen, setPreviousOpen] = useState(false);
	const [previousInitialValues, setPreviousInitialValues] = useState<string[]>(
		[],
	);

	// Internal loading states for better control
	const [assignLoading, setAssignLoading] = useState(false);

	// Computed loading states
	const isOperationLoading = assignLoading;
	const isAnyLoading =
		loading || saveDraftLoading || fetchLoading || isOperationLoading;

	// Store actions
	const assignBulkReviewers = useReviewStore((s) => s.assignBulkReviewers);
	const getEligibleReviewers = useReviewStore((s) => s.getEligibleReviewers);

	// Watch form values to compute options reactively
	const reviewer1Value = Form.useWatch('reviewer1', form);
	const reviewer2Value = Form.useWatch('reviewer2', form);

	// Helper methods for form initialization
	const shouldInitializeForm = (): boolean => {
		return (
			open && !isInitialized && eligibleLecturers.length > 0 && !fetchLoading
		);
	};

	const shouldResetForm = (): boolean => {
		return !open && previousOpen && isInitialized;
	};

	const shouldReinitializeForm = (): boolean => {
		return (
			open &&
			isInitialized &&
			eligibleLecturers.length > 0 &&
			!fetchLoading &&
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

	// Helper function to process reviewer data
	const processReviewerData = (
		reviewer: unknown,
		eligibleReviewersData: Lecturer[],
	): Lecturer => {
		// If reviewer is already a Lecturer object
		if (typeof reviewer === 'object' && reviewer && 'id' in reviewer) {
			return reviewer as Lecturer;
		}

		// If reviewer is just an ID string, find it in eligible reviewers
		const reviewerId =
			typeof reviewer === 'string' ? reviewer : String(reviewer);

		return (
			eligibleReviewersData.find((l) => l.id === reviewerId) || {
				id: reviewerId,
				fullName: 'Unknown Lecturer',
				email: '',
				isModerator: false,
			}
		);
	};

	// Determine if this is a change operation
	const isChangeMode = Boolean(
		group && group.reviewers && group.reviewers.length > 0,
	);

	// Fetch eligible reviewers for the submission
	useEffect(() => {
		let ignore = false;

		// Helper function to handle change mode logic
		const handleChangeModeReviewers = (eligibleReviewersData: Lecturer[]) => {
			if (!isChangeMode || !group?.reviewers) return;

			console.log('Change mode - current reviewers:', group.reviewers);
			const currentReviewersData = group.reviewers.map((reviewer) =>
				processReviewerData(reviewer, eligibleReviewersData),
			);
			setCurrentReviewers(currentReviewersData);
		};

		// Helper function to handle successful data fetch
		const handleSuccessfulFetch = (eligibleReviewersData: Lecturer[]) => {
			if (ignore) return;

			console.log('Received eligible reviewers:', eligibleReviewersData);
			setEligibleLecturers(eligibleReviewersData);
			handleChangeModeReviewers(eligibleReviewersData);
		};

		// Helper function to handle fetch errors
		const handleFetchError = (error: Error | unknown) => {
			console.error('Failed to fetch eligible reviewers:', error);
			if (ignore) return;

			setEligibleLecturers([]);
			setCurrentReviewers([]);
			showNotification.error(
				'Failed to Load Reviewers',
				'Unable to fetch eligible lecturers. Please try again.',
			);
		};

		if (!open || !group?.submissionId) {
			setEligibleLecturers([]);
			setCurrentReviewers([]);
			return () => {
				ignore = true;
			};
		}

		console.log(
			'Modal opened, fetching eligible reviewers for:',
			group.submissionId,
		);
		setFetchLoading(true);

		getEligibleReviewers(group.submissionId)
			.then(handleSuccessfulFetch)
			.catch(handleFetchError)
			.finally(() => {
				if (!ignore) {
					setFetchLoading(false);
				}
			});

		return () => {
			ignore = true;
		};
	}, [
		open,
		group?.submissionId,
		getEligibleReviewers,
		isChangeMode,
		group?.reviewers,
	]);

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
	}, [open, initialValues, group, eligibleLecturers, fetchLoading]);

	// Handle render key updates only when not loading
	useEffect(() => {
		if (open && !loading && isInitialized) {
			setRenderKey((prev) => prev + 1);
		}
	}, [open, loading, isInitialized]);

	// Generate stable keys for Select components
	const getReviewer1Key = (): string => {
		if (isAnyLoading) return 'reviewer1-loading';
		return `reviewer1-${reviewer2Value || 'none'}-${renderKey}`;
	};

	const getReviewer2Key = (): string => {
		if (isAnyLoading) return 'reviewer2-loading';
		return `reviewer2-${reviewer1Value || 'none'}-${renderKey}`;
	};

	// Compute all available lecturers for dropdowns
	// In change mode, we need to merge current reviewers with eligible reviewers
	const allAvailableLecturers = useMemo((): Lecturer[] => {
		if (!isChangeMode) {
			return eligibleLecturers;
		}

		// In change mode, include current reviewers so they can be displayed
		const currentReviewerIds = currentReviewers.map((r) => r.id);

		// Merge current reviewers with eligible reviewers, avoiding duplicates
		const merged = [...currentReviewers];
		eligibleLecturers.forEach((lecturer) => {
			if (!currentReviewerIds.includes(lecturer.id)) {
				merged.push(lecturer);
			}
		});

		return merged;
	}, [eligibleLecturers, currentReviewers, isChangeMode]);

	const reviewer1Options = useMemo((): LecturerOption[] => {
		const currentReviewer2 = reviewer2Value;
		if (currentReviewer2) {
			const filtered = allAvailableLecturers
				.filter((lecturer) => lecturer.id !== currentReviewer2)
				.map((lecturer) => ({
					label: lecturer.fullName,
					value: lecturer.id,
				}));
			return filtered;
		}
		const options = allAvailableLecturers.map((lecturer) => ({
			label: lecturer.fullName,
			value: lecturer.id,
		}));
		return options;
	}, [reviewer2Value, allAvailableLecturers]);

	const reviewer2Options = useMemo((): LecturerOption[] => {
		const currentReviewer1 = reviewer1Value;
		if (currentReviewer1) {
			return allAvailableLecturers
				.filter((lecturer) => lecturer.id !== currentReviewer1)
				.map((lecturer) => ({
					label: lecturer.fullName,
					value: lecturer.id,
				}));
		}
		return allAvailableLecturers.map((lecturer) => ({
			label: lecturer.fullName,
			value: lecturer.id,
		}));
	}, [reviewer1Value, allAvailableLecturers]);

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
		if (!group?.submissionId) {
			showNotification.error(
				'Invalid Operation',
				'No submission selected for reviewer assignment.',
			);
			return;
		}

		const values = form.getFieldsValue();
		const selected = [values.reviewer1, values.reviewer2].filter(
			Boolean,
		) as string[];

		if (selected.length < 2) {
			form.setFields([
				{
					name: 'reviewer1',
					errors:
						selected.length === 0 ? ['Please select a main reviewer'] : [],
				},
				{
					name: 'reviewer2',
					errors:
						selected.length < 2 ? ['Please select a secondary reviewer'] : [],
				},
			]);
			return;
		}

		await handleAssignReviewers(selected);
	};

	// Helper function to create reviewer assignments
	const createReviewerAssignments = (selected: string[]) => {
		const reviewerAssignments = [];

		if (selected[0]) {
			reviewerAssignments.push({
				lecturerId: selected[0],
				isMainReviewer: true,
			});
		}

		if (selected[1]) {
			reviewerAssignments.push({
				lecturerId: selected[1],
				isMainReviewer: false,
			});
		}

		return reviewerAssignments;
	};

	// Helper function to show success notification
	const showSuccessNotification = (
		reviewerAssignments: Array<{ lecturerId: string; isMainReviewer: boolean }>,
	) => {
		const operationType = isChangeMode ? 'changed' : 'assigned';
		const operationTitle = isChangeMode
			? 'Reviewers Changed Successfully'
			: 'Reviewers Assigned Successfully';

		const reviewerCount = reviewerAssignments.length;
		const reviewerText = reviewerCount > 1 ? 's' : '';
		const preposition = isChangeMode ? 'for' : 'to';

		showNotification.success(
			operationTitle,
			`Successfully ${operationType} ${reviewerCount} reviewer${reviewerText} ${preposition} the group.`,
		);
	};

	// Helper function to show error notification
	const showErrorNotification = (error?: Error | unknown) => {
		const operationType = isChangeMode ? 'change' : 'assign';
		const operationTitle = `${operationType.charAt(0).toUpperCase() + operationType.slice(1)}`;

		if (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: `Failed to ${operationType} reviewers`;
			showNotification.error(
				`${operationTitle} Reviewers Failed`,
				errorMessage,
			);
		} else {
			showNotification.error(
				`${operationTitle} Failed`,
				`Failed to ${operationType} reviewers. Please try again.`,
			);
		}
	};

	// Helper function to validate assignment data
	const validateAssignmentData = (): boolean => {
		if (!group?.submissionId || !assignBulkReviewers) {
			showNotification.error(
				'Operation Failed',
				'Unable to assign reviewers. Missing required data.',
			);
			return false;
		}
		return true;
	};

	const handleAssignReviewers = async (selected: string[]) => {
		if (!validateAssignmentData() || !group?.submissionId) return;

		setAssignLoading(true);

		try {
			const reviewerAssignments = createReviewerAssignments(selected);

			const result = await assignBulkReviewers!({
				assignments: [
					{
						submissionId: group.submissionId,
						reviewerAssignments,
					},
				],
			});

			if (result) {
				showSuccessNotification(reviewerAssignments);
				if (onReloadSubmission) onReloadSubmission(group.submissionId);
				onAssign(result);
			} else {
				showErrorNotification();
				onAssign(null);
			}
		} catch (error) {
			console.error('Failed to assign/change reviewers:', error);
			showErrorNotification(error);
		} finally {
			setAssignLoading(false);
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
		const mainReviewerId = values.reviewer1;
		const secondaryReviewerId = values.reviewer2;

		// Validation for Save Draft: Must select both reviewers
		// 1. Check if both reviewers are selected
		if (!mainReviewerId || !secondaryReviewerId) {
			form.setFields([
				{
					name: 'reviewer1',
					errors: !mainReviewerId ? ['Please select a main reviewer'] : [],
				},
				{
					name: 'reviewer2',
					errors: !secondaryReviewerId
						? ['Please select a secondary reviewer']
						: [],
				},
			]);

			showNotification.warning(
				'Incomplete Selection',
				'Please select both main and secondary reviewers before saving draft.',
			);
			return;
		}

		// 2. Check if both reviewers are the same
		if (mainReviewerId === secondaryReviewerId) {
			form.setFields([
				{
					name: 'reviewer1',
					errors: ['Main reviewer must be different from secondary reviewer'],
				},
				{
					name: 'reviewer2',
					errors: ['Secondary reviewer must be different from main reviewer'],
				},
			]);

			showNotification.warning(
				'Invalid Selection',
				'Main and secondary reviewers must be different persons.',
			);
			return;
		}

		// Clear any previous validation errors
		form.setFields([
			{ name: 'reviewer1', errors: [] },
			{ name: 'reviewer2', errors: [] },
		]);

		// Success notification will be handled by the parent component
		onSaveDraft(mainReviewerId, secondaryReviewerId);
	};

	// Footer button methods
	const getCancelButton = () => (
		<Button key="cancel" onClick={handleCancel} disabled={isAnyLoading}>
			Cancel
		</Button>
	);

	const getSaveDraftButton = () => (
		<Button
			key="draft"
			onClick={handleSaveDraft}
			loading={saveDraftLoading}
			disabled={isAnyLoading}
		>
			Save Draft
		</Button>
	);

	const getSubmitButton = () => (
		<Button
			key="submit"
			type="primary"
			onClick={handleFinish}
			loading={assignLoading}
			disabled={isAnyLoading}
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
	const getReviewer1Placeholder = (): string => 'Select main reviewer';
	const getReviewer2Placeholder = (): string => 'Select secondary reviewer';

	// Label methods
	const getReviewer1LabelText = (): string => 'Main Reviewer';
	const getReviewer2LabelText = (): string => 'Secondary Reviewer';

	return (
		<Modal
			title={getModalTitle()}
			open={open}
			onCancel={handleCancel}
			footer={getFooterButtons()}
			centered
			closable={!isAnyLoading}
			maskClosable={!isAnyLoading}
		>
			<Form form={form} layout="vertical" requiredMark={false}>
				<Form.Item
					label={<FormLabel text={getReviewer1LabelText()} isRequired isBold />}
					name="reviewer1"
					required={false}
					rules={[
						{
							validator: (_, value) => {
								// For Save Draft: both reviewers are required
								// For Assign/Change: validation is handled in handleFinish

								const reviewer2 =
									reviewer2Value || form.getFieldValue('reviewer2');

								// Check for duplicates
								if (value && value === reviewer2) {
									return Promise.reject(
										new Error(
											'Main reviewer must be different from secondary reviewer',
										),
									);
								}

								return Promise.resolve();
							},
						},
					]}
				>
					{fetchLoading ? (
						<Select
							placeholder="Loading lecturers..."
							disabled={true}
							loading={fetchLoading}
						/>
					) : (
						<Select
							key={getReviewer1Key()}
							placeholder={getReviewer1Placeholder()}
							options={reviewer1Options}
							allowClear
							showSearch
							disabled={isAnyLoading}
							filterOption={filterOption}
							optionLabelProp="label"
							notFoundContent={
								allAvailableLecturers.length === 0
									? 'No eligible lecturers found'
									: 'No options'
							}
							onChange={() => {
								form.validateFields(['reviewer2']);
							}}
						/>
					)}
				</Form.Item>

				<Form.Item
					label={<FormLabel text={getReviewer2LabelText()} isRequired isBold />}
					name="reviewer2"
					required={false}
					rules={[
						{
							validator: (_, value) => {
								// For Save Draft: both reviewers are required
								// For Assign/Change: validation is handled in handleFinish

								const reviewer1 =
									reviewer1Value || form.getFieldValue('reviewer1');

								// Check for duplicates
								if (value && value === reviewer1) {
									return Promise.reject(
										new Error(
											'Secondary reviewer must be different from main reviewer',
										),
									);
								}

								return Promise.resolve();
							},
						},
					]}
				>
					{fetchLoading ? (
						<Select
							placeholder="Loading lecturers..."
							disabled={true}
							loading={fetchLoading}
						/>
					) : (
						<Select
							key={getReviewer2Key()}
							placeholder={getReviewer2Placeholder()}
							options={reviewer2Options}
							allowClear
							showSearch
							disabled={isAnyLoading}
							filterOption={filterOption}
							optionLabelProp="label"
							notFoundContent={
								allAvailableLecturers.length === 0
									? 'No eligible lecturers found'
									: 'No options'
							}
							onChange={() => {
								form.validateFields(['reviewer1']);
							}}
						/>
					)}
				</Form.Item>
			</Form>
		</Modal>
	);
}
