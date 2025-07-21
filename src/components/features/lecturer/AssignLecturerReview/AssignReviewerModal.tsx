'use client';

import { Button, Form, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { GroupTableProps } from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import {
	AssignBulkReviewersResult,
	ChangeReviewerResult,
	EligibleReviewer,
} from '@/lib/services/review.service';
import { useReviewStore } from '@/store/useReviewStore';

export interface Props {
	open: boolean;
	onCancel: () => void;
	onAssign: (
		result: AssignBulkReviewersResult | ChangeReviewerResult | null,
	) => void;
	onSaveDraft?: (values: string[]) => void;
	initialValues?: string[];
	group: GroupTableProps | null;
	onReloadSubmission?: (submissionId: string) => void;
}

function AssignReviewerModal(props: Props) {
	const {
		open,
		onCancel,
		onAssign,
		onSaveDraft,
		initialValues = [],
		group,
		onReloadSubmission,
	} = props;
	const [form] = Form.useForm();
	const [eligibleLecturers, setEligibleLecturers] = useState<
		EligibleReviewer[]
	>([]);
	const [loading, setLoading] = useState(false);
	const getEligibleReviewers = useReviewStore((s) => s.getEligibleReviewers);
	const assignBulkReviewers = useReviewStore((s) => s.assignBulkReviewers);
	const changeReviewer = useReviewStore((s) => s.changeReviewer);
	const [reviewer1, setReviewer1] = useState<string | undefined>(undefined);
	const [reviewer2, setReviewer2] = useState<string | undefined>(undefined);

	// Lấy eligible lecturers khi mở modal hoặc group thay đổi, dùng store có cache
	useEffect(() => {
		let ignore = false;
		if (open && group?.submissionId) {
			setLoading(true);
			getEligibleReviewers(group.submissionId)
				.then((data) => {
					if (!ignore) setEligibleLecturers(data);
				})
				.catch(() => {
					if (!ignore) setEligibleLecturers([]);
				})
				.finally(() => {
					if (!ignore) setLoading(false);
				});
		} else if (!open) {
			setEligibleLecturers([]);
		}
		return () => {
			ignore = true;
		};
	}, [open, group?.submissionId, getEligibleReviewers]);

	useEffect(() => {
		if (open) {
			const reviewerVals =
				group?.reviewers && group.reviewers.length > 0
					? group.reviewers
					: initialValues || [];

			form.setFieldsValue({
				reviewer1: reviewerVals[0],
				reviewer2: reviewerVals[1],
			});
			setReviewer1(reviewerVals[0]);
			setReviewer2(reviewerVals[1]);
		}
	}, [open, group, initialValues, form]);

	const isChange = group && group.reviewers && group.reviewers.length > 0;

	// Helper: get current reviewer IDs if changing
	const currentReviewerIds =
		initialValues && initialValues.length === 2 ? initialValues : [];

	return (
		<Modal
			title={
				isChange
					? `Change Reviewers for Group: ${group?.code ?? ''}`
					: `Assign Reviewers for Group: ${group?.code ?? ''}`
			}
			open={open}
			onCancel={onCancel}
			footer={null}
			centered
		>
			<Form
				form={form}
				layout="vertical"
				requiredMark={false}
				onFinish={async () => {
					if (!group?.submissionId) return;
					const selected = [reviewer1, reviewer2].filter(Boolean) as string[];
					if (selected.length < 2) return;

					setLoading(true);
					try {
						if (isChange && changeReviewer && currentReviewerIds.length === 2) {
							// Call changeReviewer for each reviewer slot
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
							}
							onAssign(results.length > 0 ? results[0] : null);
						} else if (assignBulkReviewers) {
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
							}
						}
					} catch (error) {
						console.error('Failed to assign/change reviewers:', error);
					} finally {
						setLoading(false);
					}
				}}
			>
				<Form.Item
					label={<FormLabel text="Reviewer 1" isRequired isBold />}
					name="reviewer1"
				>
					<Select
						placeholder="Select reviewer"
						loading={loading}
						value={reviewer1}
						options={eligibleLecturers
							.filter((lecturer) => lecturer.id !== reviewer2)
							.map((lecturer) => ({
								label: `${lecturer.name}`,
								value: lecturer.id,
							}))}
						allowClear
						onChange={(value) => {
							setReviewer1(value);
							if (value === reviewer2) {
								setReviewer2(undefined);
								form.setFieldsValue({ reviewer2: undefined });
							}
							form.setFieldsValue({ reviewer1: value });
						}}
					/>
				</Form.Item>
				<Form.Item
					label={<FormLabel text="Reviewer 2" isRequired isBold />}
					name="reviewer2"
				>
					<Select
						placeholder="Select reviewer"
						loading={loading}
						value={reviewer2}
						options={eligibleLecturers
							.filter((lecturer) => lecturer.id !== reviewer1)
							.map((lecturer) => ({
								label: `${lecturer.name}`,
								value: lecturer.id,
							}))}
						allowClear
						onChange={(value) => {
							setReviewer2(value);
							if (value === reviewer1) {
								setReviewer1(undefined);
								form.setFieldsValue({ reviewer1: undefined });
							}
							form.setFieldsValue({ reviewer2: value });
						}}
					/>
				</Form.Item>
				<Form.Item className="text-right">
					<Button onClick={onCancel} style={{ marginRight: 8 }}>
						Cancel
					</Button>
					{onSaveDraft && !isChange && (
						<Button
							style={{ marginRight: 8 }}
							onClick={() => {
								const selected = [reviewer1, reviewer2].filter(Boolean);
								onSaveDraft(selected as string[]);
							}}
						>
							Save Draft
						</Button>
					)}
					<Button type="primary" htmlType="submit" loading={loading}>
						{isChange ? 'Change' : 'Assign'}
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}

export default AssignReviewerModal;
