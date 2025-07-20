'use client';

import { Button, Form, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { GroupTableProps } from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import {
	AssignBulkReviewersResult,
	EligibleReviewer,
} from '@/lib/services/review.service';
import { useReviewStore } from '@/store/useReviewStore';

interface Props {
	open: boolean;
	onCancel: () => void;
	onAssign: (result: AssignBulkReviewersResult) => void;
	onSaveDraft?: (values: string[]) => void;
	initialValues?: string[];
	group: GroupTableProps | null;
}

function AssignReviewerModal(props: Props) {
	const {
		open,
		onCancel,
		onAssign,
		onSaveDraft,
		initialValues = [],
		group,
	} = props;
	const [form] = Form.useForm();
	const [eligibleLecturers, setEligibleLecturers] = useState<
		EligibleReviewer[]
	>([]);
	const [loading, setLoading] = useState(false);
	const getEligibleReviewers = useReviewStore((s) => s.getEligibleReviewers);
	const assignBulkReviewers = useReviewStore((s) => s.assignBulkReviewers);
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
			form.setFieldsValue({
				reviewer1: initialValues?.[0],
				reviewer2: initialValues?.[1],
			});
			setReviewer1(initialValues?.[0]);
			setReviewer2(initialValues?.[1]);
		}
	}, [open, initialValues, form]);

	return (
		<Modal
			title={`Assign Reviewers for Group: ${group?.code ?? ''}`}
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
					// Gọi assignBulkReviewers từ store
					const result = await assignBulkReviewers?.({
						assignments: [
							{
								submissionId: group.submissionId,
								lecturerIds: selected,
							},
						],
					});
					if (result) {
						onAssign(result);
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
							// Nếu chọn trùng reviewer2 thì reset reviewer2
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
							// Nếu chọn trùng reviewer1 thì reset reviewer1
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
					{onSaveDraft && (
						<Button
							style={{ marginRight: 8 }}
							onClick={() => {
								// Lấy giá trị reviewer1, reviewer2 từ state để đảm bảo đồng bộ
								const selected = [reviewer1, reviewer2].filter(Boolean);
								onSaveDraft(selected as string[]);
							}}
						>
							Save Draft
						</Button>
					)}
					<Button type="primary" htmlType="submit">
						Assign
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
}

export default AssignReviewerModal;
