'use client';

import { Form, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';

import MilestoneForm from '@/components/features/admin/MilestoneManagement/MilestoneForm';
import { Milestone, MilestoneUpdate } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';
import { useMilestoneStore } from '@/store';

type Props = Readonly<{
	open: boolean;
	milestone: Milestone | null;
	semesters: Semester[];
	existingMilestones: Milestone[];
	onClose: () => void;
}>;

export default function EditMilestoneDialog({
	open,
	milestone,
	semesters,
	existingMilestones,
	onClose,
}: Props) {
	const [form] = Form.useForm();
	const { updating, updateMilestone } = useMilestoneStore();

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.resetFields();
		}
	}, [open, form]);
	const handleSubmit = async () => {
		if (!milestone) return;

		// Check if milestone has already started
		if (dayjs(milestone.startDate).isBefore(dayjs(), 'day')) {
			return;
		}

		// Check if semester status allows editing
		const semester = semesters.find((s) => s.id === milestone.semesterId);
		if (semester && semester.status !== 'Ongoing') {
			return;
		}

		try {
			const values = await form.validateFields();

			// Convert date range to individual dates
			const duration = values.duration ?? [];
			const [startDate, endDate] = duration;
			const milestoneData: MilestoneUpdate = {
				name: values.milestoneName,
				startDate: startDate?.toDate(),
				endDate: endDate?.toDate(),
				// Don't update semesterId since it's not editable
			};

			const success = await updateMilestone(milestone.id, milestoneData);
			if (success) {
				onClose();
			}
		} catch (error) {
			console.error('Form validation failed:', error);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};
	// Check if milestone has started or semester is not ongoing
	const milestoneHasStarted = milestone
		? dayjs(milestone.startDate).isBefore(dayjs(), 'day')
		: false;

	const semester = milestone
		? semesters.find((s) => s.id === milestone.semesterId)
		: null;
	const semesterNotOngoing = semester ? semester.status !== 'Ongoing' : false;

	const isEditDisabled = milestoneHasStarted ?? semesterNotOngoing;

	return (
		<Modal
			title="Edit Milestone"
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={updating}
			okText="Update"
			cancelText="Cancel"
			width={600}
			destroyOnHidden
			okButtonProps={{
				disabled: isEditDisabled,
			}}
			centered
		>
			{(milestoneHasStarted || semesterNotOngoing) && (
				<div
					style={{
						padding: '12px',
						marginBottom: '16px',
						backgroundColor: '#fff7e6',
						border: '1px solid #ffd591',
						borderRadius: '6px',
						color: '#d46b08',
					}}
				>
					⚠️
					{milestoneHasStarted
						? 'This milestone has already started and cannot be edited.'
						: 'This milestone cannot be edited because the semester is not in Ongoing status.'}
				</div>
			)}
			<MilestoneForm
				form={form}
				semesters={semesters}
				existingMilestones={existingMilestones}
				milestone={milestone}
				disabled={isEditDisabled}
				showSemesterField={false}
			/>
		</Modal>
	);
}
